const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherForge Factory", function () {
  let token, forge;
  let owner, lp, stakingWallet, sale, team, treasury, user1, user2;
  const CREATION_FEE = ethers.parseEther("1000"); // 1,000 AETH

  beforeEach(async function () {
    [owner, lp, stakingWallet, sale, team, treasury, user1, user2] = await ethers.getSigners();
    
    // 1. Deploy AetherVault Token (Syarat wajib untuk bayar fee)
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(lp.address, stakingWallet.address, sale.address, team.address, treasury.address);
    await token.waitForDeployment();
    
    // 2. Deploy AetherForgeFactory
    const Forge = await ethers.getContractFactory("AetherForgeFactory");
    forge = await Forge.deploy(
      await token.getAddress(),
      treasury.address,
      stakingWallet.address,
      CREATION_FEE
    );
    await forge.waitForDeployment();

    // 3. Modali User1 dengan 5.000 AETH untuk bayar biaya pembuatan (Ambil dari wallet LP)
    await token.connect(lp).transfer(user1.address, ethers.parseEther("5000"));
  });

  it("Config: Treasury, Staking, dan Fee sesuai saat inisialisasi", async function () {
    expect(await forge.treasuryAddress()).to.equal(treasury.address);
    expect(await forge.stakingContractAddress()).to.equal(stakingWallet.address);
    expect(await forge.creationFee()).to.equal(CREATION_FEE);
  });

  it("Create Token: Sukses dengan 2% Burn dan 50:50 Fee Split", async function () {
    // 1. Approve token ke kontrak Forge
    await token.connect(user1).approve(await forge.getAddress(), CREATION_FEE);

    // 2. Catat saldo sebelum transaksi
    const treasuryBalanceBefore = await token.balanceOf(treasury.address);
    const stakingBalanceBefore = await token.balanceOf(stakingWallet.address);
    const tokenStatsBefore = await token.getTokenStats();
    const burnedBefore = tokenStatsBefore.burnedAeth;

    // 3. Eksekusi Create Token
    const tx = await forge.connect(user1).createMyOwnToken("Test Token", "TST", 1000000);
    await tx.wait();

    // 4. Kalkulasi ekspektasi matematika (2% Burn, sisa dibagi 2)
    const burnAmount = (CREATION_FEE * 2n) / 100n;          // 20 AETH
    const remaining = CREATION_FEE - burnAmount;            // 980 AETH
    const expectedShare = remaining / 2n;                   // 490 AETH

    // 5. Verifikasi pemotongan dan distribusi
    const treasuryBalanceAfter = await token.balanceOf(treasury.address);
    const stakingBalanceAfter = await token.balanceOf(stakingWallet.address);
    const tokenStatsAfter = await token.getTokenStats();

    expect(tokenStatsAfter.burnedAeth - burnedBefore).to.equal(burnAmount);
    expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(expectedShare);
    expect(stakingBalanceAfter - stakingBalanceBefore).to.equal(expectedShare);

    // 6. Verifikasi jejak token anak
    const tokens = await forge.getTokensByCreator(user1.address);
    expect(tokens.length).to.equal(1);
    expect(await forge.isVerifiedForgeToken(tokens[0])).to.be.true;
  });

  it("Revert: Gagal create token tanpa Approval", async function () {
    // Langsung tembak tanpa approve, pasti ditolak oleh ERC20
    await expect(
      forge.connect(user1).createMyOwnToken("Fail Token", "FAIL", 1000000)
    ).to.be.reverted; 
  });

  it("Revert: Gagal create token dengan parameter yang salah", async function () {
    await token.connect(user1).approve(await forge.getAddress(), CREATION_FEE);

    // Nama kosong
    await expect(
      forge.connect(user1).createMyOwnToken("", "FAIL", 1000)
    ).to.be.revertedWith("Nama tidak valid");

    // Supply melewati batas maksimum (1 Triliun)
    await expect(
      forge.connect(user1).createMyOwnToken("Limit Token", "LMT", 2000000000000n)
    ).to.be.revertedWith("Supply maksimum 1 Triliun");
  });

  it("Admin: Owner bisa mengubah Fee dan Recipients", async function () {
    const newFee = ethers.parseEther("2000");
    
    // Ganti Fee
    await forge.connect(owner).setFee(newFee);
    expect(await forge.creationFee()).to.equal(newFee);

    // Ganti Recipients (Ganti treasury ke user2)
    await forge.connect(owner).setRecipients(user2.address, stakingWallet.address);
    expect(await forge.treasuryAddress()).to.equal(user2.address);
  });
});