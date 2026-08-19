const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherVaultV3 - TESTNET", function () {
  let token, v3, owner, treasury, user, heir, staking;
  
  beforeEach(async function () {
    [owner, treasury, user, heir, staking] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(owner.address, owner.address, owner.address, owner.address, treasury.address);
    await token.waitForDeployment();
    
    // Perbaikan: Memasukkan 3 parameter (Token, Treasury, Staking)
    const V3 = await ethers.getContractFactory("AetherVaultV3_Testnet");
    v3 = await V3.deploy(await token.getAddress(), treasury.address, staking.address);
    await v3.waitForDeployment();
    
    await token.transfer(user.address, ethers.parseEther("10000"));
    await token.connect(user).approve(await v3.getAddress(), ethers.parseEther("10000"));
  });

  it("Create Proof: mint NFT dengan harga paten 200 AETH", async function () {
    await v3.connect(user).createProof(
      "Identity",
      ethers.keccak256(ethers.toUtf8Bytes("filedata")),
      "ipfs://QmTest",
      true
    );
    expect(await v3.ownerOf(1)).to.equal(user.address);
    expect(await v3.totalProofs()).to.equal(1);
  });

  it("Proof duplicate hash ditolak", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("unique"));
    await v3.connect(user).createProof("Cat1", hash, "ipfs://1", true);
    await expect(v3.connect(user).createProof("Cat2", hash, "ipfs://2", true))
      .to.be.reverted;
  });

  it("Private proof: tokenURI placeholder untuk non-owner", async function () {
    await v3.connect(user).createProof("Secret", ethers.randomBytes(32), "ipfs://secret", false);
    
    // Owner NFT (user) lihat URI asli
    expect(await v3.connect(user).tokenURI(1)).to.equal("ipfs://secret");
    
    // Non-owner (treasury) lihat placeholder
    expect(await v3.connect(treasury).tokenURI(1)).to.equal("ipfs://private-aether-proof-metadata-placeholder");
  });

  it("Seal Legacy Capsule: minimal 5 menit (Aturan Testnet)", async function () {
    // Sesuai kontrak: Durasi minimal 5 menit = 300 detik
    const fiveMinutes = 5 * 60;
    
    // Uji gagal jika kurang dari 5 menit (299 detik)
    await expect(v3.connect(user).sealLegacyCapsule("Wasiat", "dummy_encrypted_text", fiveMinutes - 1, heir.address))
      .to.be.revertedWith("Durasi minimal 5 menit!");
    
    // Uji sukses jika pas 5 menit
    await v3.connect(user).sealLegacyCapsule("Wasiat", "dummy_encrypted_text", fiveMinutes, heir.address);
    expect(await v3.totalCapsules()).to.equal(1);
  });

  it("Auto-funding 50:50 ke staking langsung aktif saat deploy (Proof 200 AETH)", async function () {
    // Tidak perlu memanggil setStakingContract lagi karena sudah otomatis aktif sejak deploy
    const before = await token.balanceOf(staking.address);
    await v3.connect(user).createProof("Test", ethers.randomBytes(32), "ipfs://x", true);
    const after = await token.balanceOf(staking.address);
    
    // 200 (Cost) - 40 (Burn) = 160. Dibagi dua = 80 AETH untuk staking
    expect(after - before).to.equal(ethers.parseEther("80"));
  });

  it("Pagination: getUserCapsulesPaginated", async function () {
    for (let i = 0; i < 3; i++) {
      // Max durasi Kapsul Basic di testnet adalah 10 menit (600 detik).
      // Unlock time diset 5 menit (300 detik) dari block terbaru.
      const fiveMinutesLock = (await ethers.provider.getBlock("latest")).timestamp + 300;
      
      await v3.connect(user).sealTimeLockCapsule(
        0, // Tier.Basic
        `Judul${i}`,
        "dummy_encrypted_text", 
        fiveMinutesLock
      );
    }
    const page = await v3.getUserCapsulesPaginated(user.address, 0, 2);
    expect(page.length).to.equal(2);
  });
});