const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherVaultV3", function () {
  let token, v3, owner, treasury, user, heir, staking;
  
  beforeEach(async function () {
    [owner, treasury, user, heir, staking] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(owner.address, owner.address, owner.address, owner.address, treasury.address);
    await token.waitForDeployment();
    
    const V3 = await ethers.getContractFactory("AetherVaultV3");
    v3 = await V3.deploy(await token.getAddress(), treasury.address);
    await v3.waitForDeployment();
    
    await token.transfer(user.address, ethers.parseEther("10000"));
    await token.connect(user).approve(await v3.getAddress(), ethers.parseEther("10000"));
  });

  it("Create Proof: tier Basic mint NFT", async function () {
    await v3.connect(user).createProof(
      0,
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
    await v3.connect(user).createProof(0, "Cat1", hash, "ipfs://1", true);
    await expect(v3.connect(user).createProof(0, "Cat2", hash, "ipfs://2", true))
      .to.be.reverted;
  });

    it("Private proof: tokenURI placeholder untuk non-owner", async function () {
    await v3.connect(user).createProof(0, "Secret", ethers.randomBytes(32), "ipfs://secret", false);
    
    // Owner NFT (user) lihat URI asli
    expect(await v3.connect(user).tokenURI(1)).to.equal("ipfs://secret");
    
    // Non-owner (treasury) lihat placeholder
    expect(await v3.connect(treasury).tokenURI(1)).to.equal("ipfs://private-aether-proof-metadata-placeholder");
  });

  it("Seal Legacy Capsule: minimal 5 tahun", async function () {
    const fiveYears = 5 * 365 * 24 * 60 * 60;
    await expect(v3.connect(user).sealLegacyCapsule("Wasiat", ethers.randomBytes(32), fiveYears - 1, heir.address))
      .to.be.reverted;
    
    await v3.connect(user).sealLegacyCapsule("Wasiat", ethers.randomBytes(32), fiveYears, heir.address);
    expect(await v3.totalCapsules()).to.equal(1);
  });

  it("Auto-funding 50:50 ke staking", async function () {
    await v3.setStakingContract(staking.address);
    
    const before = await token.balanceOf(staking.address);
    await v3.connect(user).createProof(0, "Test", ethers.randomBytes(32), "ipfs://x", true);
    const after = await token.balanceOf(staking.address);
    
    expect(after - before).to.equal(ethers.parseEther("4"));
  });

    it("Pagination: getUserCapsulesPaginated", async function () {
    for (let i = 0; i < 3; i++) {
      await v3.connect(user).sealTimeLockCapsule(
        0, // Tier.Basic
        `Judul${i}`,
        ethers.randomBytes(32),
        (await ethers.provider.getBlock("latest")).timestamp + 86400
      );
    }
    const page = await v3.getUserCapsulesPaginated(user.address, 0, 2);
    expect(page.length).to.equal(2);
  });
});