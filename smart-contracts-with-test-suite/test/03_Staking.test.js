const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherVaultStakingSecureV6", function () {
  let token, staking, owner, user;
  
  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(owner.address, owner.address, owner.address, owner.address, owner.address);
    await token.waitForDeployment();
    
    const Staking = await ethers.getContractFactory("AetherVaultStakingSecureV6");
    staking = await Staking.deploy(await token.getAddress());
    await staking.waitForDeployment();
    
    await token.transfer(user.address, ethers.parseEther("100000"));
    await token.connect(user).approve(await staking.getAddress(), ethers.parseEther("100000"));
    
    await token.approve(await staking.getAddress(), ethers.parseEther("50000"));
    await staking.fundRewardPool(ethers.parseEther("50000"));
  });

  it("Stake: Tier 0 without lock", async function () {
    const amount = ethers.parseEther("1000");
    await staking.connect(user).stake(0, amount);
    const deposits = await staking.getUserDeposits(user.address);
    expect(deposits.length).to.equal(1);
    expect(deposits[0].amount).to.equal(amount);
  });

  it("Max deposit per wallet: 50", async function () {
    for (let i = 0; i < 50; i++) {
      await staking.connect(user).stake(0, ethers.parseEther("100"));
    }
    await expect(staking.connect(user).stake(0, ethers.parseEther("100")))
      .to.be.revertedWithCustomError(staking, "ExceedsMaxDeposits");
  });

  it("Withdraw: Cannot withdraw before unlock", async function () {
    await staking.connect(user).stake(1, ethers.parseEther("1000"));
    const dep = await staking.getUserDeposits(user.address);
    await expect(staking.connect(user).withdraw(dep[0].id, ethers.parseEther("100")))
      .to.be.revertedWithCustomError(staking, "TokenStillLocked");
  });

  it("Emergency withdraw: Can withdraw even if paused", async function () {
    await staking.connect(user).stake(0, ethers.parseEther("1000"));
    await staking.pause();
    const dep = await staking.getUserDeposits(user.address);
    const before = await token.balanceOf(user.address);
    await staking.connect(user).emergencyWithdraw(dep[0].id);
    const after = await token.balanceOf(user.address);
    expect(after).to.be.gt(before);
  });

  it("Claim reward: Reward increases over time", async function () {
    await staking.connect(user).stake(0, ethers.parseEther("10000"));
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine");
    const reward = await staking.calculateReward(user.address);
    expect(reward).to.be.gt(0);
    const before = await token.balanceOf(user.address);
    await staking.connect(user).claimReward();
    const after = await token.balanceOf(user.address);
    expect(after).to.be.gt(before);
  });

  it("Tier update: Requires 3-minute timelock", async function () {
    await staking.requestTierUpdate(0, 500, 0);
    await expect(staking.executeTierUpdate(0))
      .to.be.revertedWithCustomError(staking, "TimelockNotExpired");
    await ethers.provider.send("evm_increaseTime", [4 * 60]); 
    await ethers.provider.send("evm_mine");
    await staking.executeTierUpdate(0);
    const tier = await staking.tiers(0);
    expect(tier.apy).to.equal(500);
  });

  it("Rescue: Cannot rescue AETH", async function () {
    await expect(staking.rescueForeignERC20(await token.getAddress(), owner.address, 100))
      .to.be.revertedWithCustomError(staking, "CannotRescueStakedToken");
  });
});