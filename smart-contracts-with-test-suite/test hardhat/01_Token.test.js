const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherVault (Token)", function () {
  let token, owner, lp, stakingWallet, sale, team, treasury, user;
  
  beforeEach(async function () {
    [owner, lp, stakingWallet, sale, team, treasury, user] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(lp.address, stakingWallet.address, sale.address, team.address, treasury.address);
    await token.waitForDeployment();
  });

  it("Deploy: Total supply 100 million AETH", async function () {
    const supply = await token.totalSupply();
    expect(supply).to.equal(ethers.parseEther("100000000"));
  });

  it("Distribution: LP 30%, Staking 25%, Sale 20%, Team 15%, Treasury 10%", async function () {
    const total = ethers.parseEther("100000000");
    expect(await token.balanceOf(lp.address)).to.equal(total * 30n / 100n);
    expect(await token.balanceOf(stakingWallet.address)).to.equal(total * 25n / 100n);
    expect(await token.balanceOf(sale.address)).to.equal(total * 20n / 100n);
    expect(await token.balanceOf(team.address)).to.equal(total * 15n / 100n);
    expect(await token.balanceOf(treasury.address)).to.equal(total * 10n / 100n);
  });

  it("Burn tracking: burn() is recorded", async function () {
    const burnAmount = ethers.parseEther("1000");
    await token.connect(lp).burn(burnAmount);
    const stats = await token.getTokenStats();
    expect(stats.burnedAeth).to.equal(burnAmount);
  });

  it("Treasury update: Owner only", async function () {
    await expect(token.connect(user).updateTreasury(user.address)).to.be.reverted;
    await token.updateTreasury(user.address);
  });

  it("Rescue: Cannot rescue own token", async function () {
    await expect(token.rescueForeignERC20(await token.getAddress(), owner.address, 100))
      .to.be.reverted;
  });
});