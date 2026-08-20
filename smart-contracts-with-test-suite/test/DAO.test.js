const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("AetherVault DAO Ecosystem (veAETH & Governor Testnet)", function () {
  let aeth, veAeth, governor;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // 1. Deploy Token Utama (AETH)
    const AetherVault = await ethers.getContractFactory("AetherVault");
    aeth = await AetherVault.deploy(
      owner.address, owner.address, owner.address, owner.address, owner.address
    );
    await aeth.waitForDeployment();
    const aethAddress = await aeth.getAddress();

    // 2. Deploy veAETH (Loket Tiket)
    const VeAETH = await ethers.getContractFactory("veAETH");
    veAeth = await VeAETH.deploy(aethAddress);
    await veAeth.waitForDeployment();
    const veAethAddress = await veAeth.getAddress();

    // 3. Deploy Governor (Gedung Parlemen - Versi Testnet)
    const Governor = await ethers.getContractFactory("AetherGovernor");
    governor = await Governor.deploy(veAethAddress);
    await governor.waitForDeployment();

    // Persiapan Saldo: Beri user1 (5000 AETH) dan user2 (500 AETH)
    await aeth.transfer(user1.address, ethers.parseEther("5000"));
    await aeth.transfer(user2.address, ethers.parseEther("500"));
  });

  describe("1. Kontrak veAETH (Brankas & Tiket DAO)", function () {
    it("Harus bisa deposit AETH dan mencetak veAETH 1:1", async function () {
      const depositAmount = ethers.parseEther("100");
      await aeth.connect(user1).approve(await veAeth.getAddress(), depositAmount);
      await veAeth.connect(user1).deposit(depositAmount);

      expect(await veAeth.balanceOf(user1.address)).to.equal(depositAmount);
      expect(await aeth.balanceOf(await veAeth.getAddress())).to.equal(depositAmount);
    });

    it("Harus bisa withdraw dan mengembalikan AETH secara utuh", async function () {
      const amount = ethers.parseEther("100");
      await aeth.connect(user1).approve(await veAeth.getAddress(), amount);
      await veAeth.connect(user1).deposit(amount);

      await veAeth.connect(user1).withdraw(amount);

      expect(await veAeth.balanceOf(user1.address)).to.equal(0);
      expect(await aeth.balanceOf(user1.address)).to.equal(ethers.parseEther("5000"));
    });

    it("Harus GAGAL (Revert) jika veAETH ditransfer (Soulbound Test)", async function () {
      const amount = ethers.parseEther("100");
      await aeth.connect(user1).approve(await veAeth.getAddress(), amount);
      await veAeth.connect(user1).deposit(amount);

      await expect(
        veAeth.connect(user1).transfer(user2.address, amount)
      ).to.be.revertedWith("veAETH is Soulbound: Tidak bisa ditransfer antar wallet");
    });
  });

  describe("2. Kontrak AetherGovernor (Voting & Proposal - Testnet Time)", function () {
    const description = "Proposal Testnet: Uji Coba Cepat";
    let encodedFunctionCall;

    beforeEach(async function () {
      // User1 mengunci 2000 AETH (Melewati Threshold 1000)
      await aeth.connect(user1).approve(await veAeth.getAddress(), ethers.parseEther("2000"));
      await veAeth.connect(user1).deposit(ethers.parseEther("2000"));
      await veAeth.connect(user1).delegate(user1.address);

      // User2 mengunci 500 AETH (Di bawah Threshold)
      await aeth.connect(user2).approve(await veAeth.getAddress(), ethers.parseEther("500"));
      await veAeth.connect(user2).deposit(ethers.parseEther("500"));
      await veAeth.connect(user2).delegate(user2.address);

      encodedFunctionCall = aeth.interface.encodeFunctionData("burn", [ethers.parseEther("1")]);
    });

    it("Harus GAGAL membuat proposal jika saldo veAETH di bawah Threshold (Anti-Spam)", async function () {
      await expect(
        governor.connect(user2).propose([await aeth.getAddress()], [0], [encodedFunctionCall], description)
      ).to.be.reverted;
    });

    it("Harus SUKSES membuat proposal & voting dengan durasi Testnet", async function () {
      // 1. User1 Membuat Proposal
      await governor.connect(user1).propose([await aeth.getAddress()], [0], [encodedFunctionCall], description);
      
      const proposalId = await governor.hashProposal([await aeth.getAddress()], [0], [encodedFunctionCall], ethers.keccak256(ethers.toUtf8Bytes(description)));

      // 2. Tambang 200 blok (Aman melewati 180 blok Voting Delay)
      await mine(200);

      // Cek status harus Aktif (1)
      let state = await governor.state(proposalId);
      expect(state).to.equal(1n);

      // 3. User1 Voting Setuju (1 = For)
      await governor.connect(user1).castVote(proposalId, 1);

      // 4. Tambang 700 blok (Aman melewati 600 blok Voting Period)
      await mine(700);

      // Cek status harus Selesai/Succeeded (4)
      state = await governor.state(proposalId);
      expect(state).to.equal(4n);
    });
  });
});