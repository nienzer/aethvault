const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AethVaultFaucetV3 (Faucet)", function () {
  let token, faucet;
  let owner, lp, stakingWallet, sale, team, treasury, user1, user2;
  const CLAIM_AMOUNT = ethers.parseEther("5000"); 
  const MAX_CLAIM = ethers.parseEther("10000"); 

  beforeEach(async function () {
    [owner, lp, stakingWallet, sale, team, treasury, user1, user2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(lp.address, stakingWallet.address, sale.address, team.address, treasury.address);
    await token.waitForDeployment();

    const Faucet = await ethers.getContractFactory("AethVaultFaucetV3");
    faucet = await Faucet.deploy(await token.getAddress(), CLAIM_AMOUNT);
    await faucet.waitForDeployment();

    const fundAmount = ethers.parseEther("500000"); 
    await token.connect(lp).transfer(await faucet.getAddress(), fundAmount);
  });

  it("Deploy: Check initial configuration and balance", async function () {
    expect(await faucet.claimAmount()).to.equal(CLAIM_AMOUNT);
    expect(await token.balanceOf(await faucet.getAddress())).to.equal(ethers.parseEther("500000"));
  });

  it("Claim: User can claim successfully and canClaim() updates correctly", async function () {
    expect(await faucet.canClaim(user1.address)).to.be.true;

    await expect(faucet.connect(user1).claim())
      .to.emit(faucet, "FaucetClaimed")
      .withArgs(user1.address, CLAIM_AMOUNT);

    expect(await token.balanceOf(user1.address)).to.equal(CLAIM_AMOUNT);
    expect(await faucet.canClaim(user1.address)).to.be.false;
  });

  it("Cooldown: Revert if claiming twice within 24 hours", async function () {
    await faucet.connect(user1).claim();

    // Revert dengan pesan buatan kita sendiri
    await expect(faucet.connect(user1).claim()).to.be.revertedWith("Please wait 24 hours");

    await time.increase(12 * 60 * 60);
    await expect(faucet.connect(user1).claim()).to.be.revertedWith("Please wait 24 hours");

    await time.increase(12 * 60 * 60 + 1);
    await faucet.connect(user1).claim();
    expect(await token.balanceOf(user1.address)).to.equal(CLAIM_AMOUNT * 2n);
  });

  it("Pause: Cannot claim when paused", async function () {
    await faucet.pause();
    expect(await faucet.canClaim(user1.address)).to.be.false;

    // Di OZ v5, Pausable melempar Custom Error "EnforcedPause()".
    // Kita gunakan to.be.reverted agar aman dan sesuai standar tes bos.
    await expect(faucet.connect(user1).claim()).to.be.reverted;

    await faucet.unpause();
    await faucet.connect(user1).claim(); 
  });

  it("Admin: setClaimAmount works and respects MAX_CLAIM", async function () {
    const newAmount = ethers.parseEther("8000");
    await faucet.setClaimAmount(newAmount);
    expect(await faucet.claimAmount()).to.equal(newAmount);

    const crazyAmount = ethers.parseEther("15000");
    await expect(faucet.setClaimAmount(crazyAmount)).to.be.revertedWith("Amount invalid");
  });

  it("Admin: withdrawRemainingTokens secures the funds", async function () {
    const faucetBalance = await token.balanceOf(await faucet.getAddress());
    
    await faucet.withdrawRemainingTokens();
    
    expect(await token.balanceOf(await faucet.getAddress())).to.equal(0n);
    expect(await token.balanceOf(owner.address)).to.equal(faucetBalance);
  });

  it("Security: Only owner can access admin functions", async function () {
    // Di OZ v5, Ownable melempar Custom Error "OwnableUnauthorizedAccount()".
    await expect(faucet.connect(user1).pause()).to.be.reverted;
    await expect(faucet.connect(user1).withdrawRemainingTokens()).to.be.reverted;
    await expect(faucet.connect(user1).setClaimAmount(ethers.parseEther("100"))).to.be.reverted;
  });
});