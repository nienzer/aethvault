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

  it("Cliff 3 menit: claim 0 sebelum waktu", async function () {
    expect(await vesting.claimableAmount()).to.equal(0);
    await expect(vesting.connect(dev).claim()).to.be.reverted;
  });

  it("Setelah 3 menit: bisa claim proporsional", async function () {
    await ethers.provider.send("evm_increaseTime", [3 * 60]); // Maju 3 Menit
    await ethers.provider.send("evm_mine");
    
    const claimable = await vesting.claimableAmount();
    const expected = ALLOCATION * 3n / 10n; // Karena rilis selesai 10 menit
    
    // ⚡ FIX: Ubah toleransi jadi 50000 karena di Testnet 1 detik = 25.000 AETH
    expect(claimable).to.be.closeTo(expected, ethers.parseEther("50000"));
    
    const before = await token.balanceOf(dev.address);
    await vesting.connect(dev).claim();
    const after = await token.balanceOf(dev.address);
    
    // ⚡ FIX: Ubah toleransi jadi 50000 juga di sini
    expect(after - before).to.be.closeTo(expected, ethers.parseEther("50000"));
  });

  it("Setelah 10 menit: bisa claim 100%", async function () {
    await ethers.provider.send("evm_increaseTime", [10 * 60]); // Maju 10 menit
    await ethers.provider.send("evm_mine");
    
    await vesting.connect(dev).claim();
    expect(await token.balanceOf(dev.address)).to.be.closeTo(ALLOCATION, ethers.parseEther("100"));
  });

  it("Change beneficiary: dev bisa ganti wallet dengan timelock 3 menit", async function () {
    await vesting.connect(dev).requestBeneficiaryChange(newDev.address);
    
    // Gagal kalau belum 3 menit
    await expect(vesting.connect(newDev).confirmBeneficiaryChange())
      .to.be.revertedWith("Timelock belum selesai");

    // Majukan waktu 4 menit biar aman
    await ethers.provider.send("evm_increaseTime", [4 * 60]);
    await ethers.provider.send("evm_mine");

    await vesting.connect(newDev).confirmBeneficiaryChange();
    
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
    // Claim #1 di menit ke-3
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    const afterFirst = await token.balanceOf(dev.address);

    // Claim #2 di menit ke-6
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();
    const afterSecond = await token.balanceOf(dev.address);
    expect(afterSecond).to.be.gt(afterFirst);

    // Claim #3 di menit ke-11 (Sudah lewat batas 10 menit, rilis 100%)
    await ethers.provider.send("evm_increaseTime", [5 * 60]);
    await ethers.provider.send("evm_mine");
    await vesting.connect(dev).claim();

    // Total akhir = 15M
    expect(await token.balanceOf(dev.address)).to.be.closeTo(ALLOCATION, ethers.parseEther("100"));

    // Claim ke-4 harus gagal karena dana habis
    await expect(vesting.connect(dev).claim())
      .to.be.revertedWith("Belum ada token baru yang bisa di-claim");
  });
});