const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TeamVesting", function () {
  let token, vesting, owner, dev, newDev;
  const ALLOCATION = ethers.parseEther("15000000");
  
  beforeEach(async function () {
    [owner, dev, newDev] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(owner.address, owner.address, owner.address, owner.address, owner.address);
    await token.waitForDeployment();
    
    const Vesting = await ethers.getContractFactory("TeamVesting");
    vesting = await Vesting.deploy(await token.getAddress(), dev.address, 0, ALLOCATION);
    await vesting.waitForDeployment();
    
    await token.transfer(await vesting.getAddress(), ALLOCATION);
  });

  it("Constructor: totalAllocated immutable 15M", async function () {
    expect(await vesting.totalAllocated()).to.equal(ALLOCATION);
    expect(await vesting.beneficiary()).to.equal(dev.address);
  });

  it("3-Minute Cliff: Claim 0 before time", async function () {
    expect(await vesting.claimableAmount()).to.equal(0);
    await expect(vesting.connect(dev).claim()).to.be.reverted;
  });

  it("After 3 minutes: Can claim proportionally", async function () {
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");
    const claimable = await vesting.claimableAmount();
    const expected = ALLOCATION * 3n / 10n;
    expect(claimable).to.be.closeTo(expected, ethers.parseEther("50000"));
    
    const before = await token.balanceOf(dev.address);
    await vesting.connect(dev).claim();
    const after = await token.balanceOf(dev.address);
    expect(after - before).to.be.closeTo(expected, ethers.parseEther("50000"));
  });

  it("After 10 minutes: Can claim 100%", async function () {
    await ethers.provider.send("evm_increaseTime", [10 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    expect(await token.balanceOf(dev.address)).to.be.closeTo(ALLOCATION, ethers.parseEther("100"));
  });

  it("Change beneficiary: Dev can change wallet with 3-minute timelock", async function () {
    await vesting.connect(dev).requestBeneficiaryChange(newDev.address);
    await expect(vesting.connect(newDev).confirmBeneficiaryChange())
      .to.be.revertedWith("Timelock belum selesai");

    await ethers.provider.send("evm_increaseTime", [4 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(newDev).confirmBeneficiaryChange();
    expect(await vesting.beneficiary()).to.equal(newDev.address);
  });

  it("Rescue excess: Cannot touch vesting allocation", async function () {
    await token.transfer(await vesting.getAddress(), ethers.parseEther("100000"));
    await expect(
      vesting.connect(dev).rescueExcessTokens(await token.getAddress(), dev.address, ethers.parseEther("100001"))
    ).to.be.reverted;
    
    await vesting.connect(dev).rescueExcessTokens(await token.getAddress(), dev.address, ethers.parseEther("100000"));
    expect(await token.balanceOf(dev.address)).to.equal(ethers.parseEther("100000"));
  });

  it("Multiple claims: Total remains the same", async function () {
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    const afterFirst = await token.balanceOf(dev.address);

    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    const afterSecond = await token.balanceOf(dev.address);
    expect(afterSecond).to.be.gt(afterFirst);

    await ethers.provider.send("evm_increaseTime", [5 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    expect(await token.balanceOf(dev.address)).to.be.closeTo(ALLOCATION, ethers.parseEther("100"));
  });
});