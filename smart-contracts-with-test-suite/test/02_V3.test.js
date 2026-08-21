const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherVaultV3 - TESTNET", function () {
  let token, v3, owner, treasury, user, heir, staking;
  
  beforeEach(async function () {
    [owner, treasury, user, heir, staking] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherVault");
    token = await Token.deploy(owner.address, owner.address, owner.address, owner.address, treasury.address);
    await token.waitForDeployment();
    
    const V3 = await ethers.getContractFactory("AetherVaultV3_Testnet");
    v3 = await V3.deploy(await token.getAddress(), treasury.address, staking.address);
    await v3.waitForDeployment();
    
    await token.transfer(user.address, ethers.parseEther("10000"));
    await token.connect(user).approve(await v3.getAddress(), ethers.parseEther("10000"));
  });

  it("Create Proof: Mint NFT with a fixed price of 200 AETH", async function () {
    await v3.connect(user).createProof(
      "Identity",
      ethers.keccak256(ethers.toUtf8Bytes("filedata")),
      "ipfs://QmTest",
      true
    );
    expect(await v3.ownerOf(1)).to.equal(user.address);
    expect(await v3.totalProofs()).to.equal(1);
  });

  it("Proof duplicate hash is rejected", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("unique"));
    await v3.connect(user).createProof("Cat1", hash, "ipfs://1", true);
    await expect(v3.connect(user).createProof("Cat2", hash, "ipfs://2", true))
      .to.be.reverted;
  });

  it("Private proof: tokenURI placeholder for non-owners", async function () {
    await v3.connect(user).createProof("Secret", ethers.randomBytes(32), "ipfs://secret", false);
    expect(await v3.connect(user).tokenURI(1)).to.equal("ipfs://secret");
    expect(await v3.connect(treasury).tokenURI(1)).to.equal("ipfs://private-aether-proof-metadata-placeholder");
  });

  it("Seal Legacy Capsule: Minimum 5 minutes (Testnet Rule)", async function () {
    const fiveMinutes = 5 * 60;
    await expect(v3.connect(user).sealLegacyCapsule("Will", "dummy_encrypted_text", fiveMinutes - 1, heir.address))
      .to.be.revertedWith("Durasi minimal 5 menit!");
    await v3.connect(user).sealLegacyCapsule("Will", "dummy_encrypted_text", fiveMinutes, heir.address);
    expect(await v3.totalCapsules()).to.equal(1);
  });

  it("Auto-funding 50:50 to staking is active immediately upon deploy (Proof 200 AETH)", async function () {
    const before = await token.balanceOf(staking.address);
    await v3.connect(user).createProof("Test", ethers.randomBytes(32), "ipfs://x", true);
    const after = await token.balanceOf(staking.address);
    expect(after - before).to.equal(ethers.parseEther("80"));
  });

  it("Pagination: getUserCapsulesPaginated", async function () {
    for (let i = 0; i < 3; i++) {
      const fiveMinutesLock = (await ethers.provider.getBlock("latest")).timestamp + 300;
      await v3.connect(user).sealTimeLockCapsule(0, `Title${i}`, "dummy_encrypted_text", fiveMinutesLock);
    }
    const page = await v3.getUserCapsulesPaginated(user.address, 0, 2);
    expect(page.length).to.equal(2);
  });
});