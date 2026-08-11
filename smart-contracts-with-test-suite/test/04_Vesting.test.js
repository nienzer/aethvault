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

  it("Cliff 6 bulan: claim 0 sebelum waktu", async function () {
    expect(await vesting.claimableAmount()).to.equal(0);
    await expect(vesting.connect(dev).claim()).to.be.reverted;
  });

  it("Setelah 6 bulan: bisa claim 25%", async function () {
    await ethers.provider.send("evm_increaseTime", [180 * 86400]);
    await ethers.provider.send("evm_mine");
    
    const claimable = await vesting.claimableAmount();
    const expected = ALLOCATION * 180n / 730n;
    expect(claimable).to.be.closeTo(expected, ethers.parseEther("1000"));
    
    const before = await token.balanceOf(dev.address);
    await vesting.connect(dev).claim();
    const after = await token.balanceOf(dev.address);
    expect(after - before).to.be.closeTo(expected, ethers.parseEther("1000"));
  });

  it("Setelah 24 bulan: bisa claim 100%", async function () {
    await ethers.provider.send("evm_increaseTime", [730 * 86400]);
    await ethers.provider.send("evm_mine");
    
    await vesting.connect(dev).claim();
    expect(await token.balanceOf(dev.address)).to.be.closeTo(ALLOCATION, ethers.parseEther("100"));
  });

  it("Change beneficiary: dev bisa ganti wallet", async function () {
    await vesting.connect(dev).changeBeneficiary(newDev.address);
    expect(await vesting.beneficiary()).to.equal(newDev.address);
    await expect(vesting.connect(dev).claim()).to.be.reverted;
  });

  it("Rescue excess: tidak boleh sentuh alokasi vesting", async function () {
    await token.transfer(await vesting.getAddress(), ethers.parseEther("100000"));
    
    await expect(
      vesting.connect(dev).rescueExcessTokens(
        await token.getAddress(), 
        dev.address, 
        ethers.parseEther("100001")
      )
    ).to.be.reverted;
    
    await vesting.connect(dev).rescueExcessTokens(
      await token.getAddress(),
      dev.address,
      ethers.parseEther("100000")
    );
    
    expect(await token.balanceOf(dev.address)).to.equal(ethers.parseEther("100000"));
  });

    it("Claim berkali-kali: total tetap sama", async function () {
    // Claim #1 di bulan 6 (~25%)
    await ethers.provider.send("evm_increaseTime", [180 * 86400]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    const afterFirst = await token.balanceOf(dev.address);

    // Claim #2 di bulan 12 (~50% total)
    await ethers.provider.send("evm_increaseTime", [180 * 86400]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    const afterSecond = await token.balanceOf(dev.address);
    expect(afterSecond).to.be.gt(afterFirst);

    // Claim #3 di bulan 24 (100% total)
    await ethers.provider.send("evm_increaseTime", [370 * 86400]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();

    // Total akhir = 15M
    expect(await token.balanceOf(dev.address)).to.be.closeTo(ALLOCATION, ethers.parseEther("100"));

    // Claim ke-4 harus gagal (sudah habis)
    await expect(vesting.connect(dev).claim())
      .to.be.revertedWith("Belum ada token baru yang bisa di-claim");
  });
});