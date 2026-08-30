const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ecosystem Admin & Rescue Operations", function () {
  let token, staking, vesting, foreignToken;
  let owner, lp, stakingWallet, sale, team, treasury, user;

  beforeEach(async function () {
    [owner, lp, stakingWallet, sale, team, treasury, user] = await ethers.getSigners();
    
    // Deploy Token Utama
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(lp.address, stakingWallet.address, sale.address, team.address, treasury.address);
    await token.waitForDeployment();

    // Deploy Token Palsu/Asing (Untuk simulasi token nyangkut)
    foreignToken = await Token.deploy(owner.address, owner.address, owner.address, owner.address, owner.address); 
    await foreignToken.waitForDeployment();

    // Deploy Staking
    const Staking = await ethers.getContractFactory("AetherVaultStakingSecureV6");
    staking = await Staking.deploy(await token.getAddress());
    await staking.waitForDeployment();

    // Deploy Vesting
    const Vesting = await ethers.getContractFactory("TeamVesting");
    vesting = await Vesting.deploy(await token.getAddress(), team.address, 0, ethers.parseEther("15000000"));
    await vesting.waitForDeployment();
  });

  // Tes 1 (Ke-36): Pause & Unpause Token
  it("Token Admin: Dapat melakukan Pause dan Unpause transaksi", async function () {
    await token.connect(owner).pause();
    await expect(token.connect(lp).transfer(user.address, ethers.parseEther("10"))).to.be.reverted;
    
    await token.connect(owner).unpause();
    await expect(token.connect(lp).transfer(user.address, ethers.parseEther("10"))).to.not.be.reverted;
  });

  // Tes 2 (Ke-37): Rescue Native Coin (ETH/BNB) di Token Contract
  it("Token Admin: Dapat menyelamatkan (rescue) koin native yang nyangkut", async function () {
    await owner.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
    const balanceBefore = await ethers.provider.getBalance(treasury.address);
    
    await token.connect(owner).rescueNativeCoin(treasury.address, ethers.parseEther("1"));
    
    const balanceAfter = await ethers.provider.getBalance(treasury.address);
    expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1"));
  });

  // Tes 3 (Ke-38): Pause Staking Contract
  it("Staking Admin: Dapat menghentikan (Pause) fungsi staking dalam keadaan darurat", async function () {
    await staking.connect(owner).pause();
    await token.connect(lp).approve(await staking.getAddress(), ethers.parseEther("100"));
    
    await expect(
      staking.connect(lp).stake(0, ethers.parseEther("100"))
    ).to.be.reverted; 
  });

  // Tes 4 (Ke-39): Rescue Foreign Token di Vesting Contract
  it("Vesting Admin: Beneficiary dapat menyelamatkan token asing yang nyangkut", async function () {
    const foreignAddress = await foreignToken.getAddress();
    await foreignToken.connect(owner).transfer(await vesting.getAddress(), ethers.parseEther("500"));
    
    await vesting.connect(team).rescueExcessTokens(foreignAddress, user.address, ethers.parseEther("500"));
    expect(await foreignToken.balanceOf(user.address)).to.equal(ethers.parseEther("500"));
  });
});