const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("AetherVault DAO Ecosystem (veAETH & Governor Testnet)", function () {
  let aeth, veAeth, governor;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const AetherVault = await ethers.getContractFactory("AetherVault");
    aeth = await AetherVault.deploy(owner.address, owner.address, owner.address, owner.address, owner.address);
    await aeth.waitForDeployment();
    const aethAddress = await aeth.getAddress();

    const VeAETH = await ethers.getContractFactory("veAETH");
    veAeth = await VeAETH.deploy(aethAddress);
    await veAeth.waitForDeployment();
    const veAethAddress = await veAeth.getAddress();

    const Governor = await ethers.getContractFactory("AetherGovernor");
    governor = await Governor.deploy(veAethAddress);
    await governor.waitForDeployment();

    await aeth.transfer(user1.address, ethers.parseEther("5000"));
    await aeth.transfer(user2.address, ethers.parseEther("500"));
  });

  describe("1. veAETH Contract (Vault & DAO Tickets)", function () {
    it("Should be able to deposit AETH and mint veAETH 1:1", async function () {
      const depositAmount = ethers.parseEther("100");
      await aeth.connect(user1).approve(await veAeth.getAddress(), depositAmount);
      await veAeth.connect(user1).deposit(depositAmount);
      expect(await veAeth.balanceOf(user1.address)).to.equal(depositAmount);
    });

    it("Should be able to withdraw and return full AETH", async function () {
      const amount = ethers.parseEther("100");
      await aeth.connect(user1).approve(await veAeth.getAddress(), amount);
      await veAeth.connect(user1).deposit(amount);
      await veAeth.connect(user1).withdraw(amount);
      expect(await veAeth.balanceOf(user1.address)).to.equal(0);
    });

    it("Should REVERT if veAETH is transferred (Soulbound Test)", async function () {
      const amount = ethers.parseEther("100");
      await aeth.connect(user1).approve(await veAeth.getAddress(), amount);
      await veAeth.connect(user1).deposit(amount);
      await expect(
        veAeth.connect(user1).transfer(user2.address, amount)
      ).to.be.revertedWith("veAETH is Soulbound: Tidak bisa ditransfer antar wallet");
    });
  });

  describe("2. AetherGovernor Contract (Voting & Proposal - Testnet Time)", function () {
    const description = "Proposal Testnet: Rapid Trial";
    let encodedFunctionCall;

    beforeEach(async function () {
      await aeth.connect(user1).approve(await veAeth.getAddress(), ethers.parseEther("2000"));
      await veAeth.connect(user1).deposit(ethers.parseEther("2000"));
      await veAeth.connect(user1).delegate(user1.address);

      await aeth.connect(user2).approve(await veAeth.getAddress(), ethers.parseEther("500"));
      await veAeth.connect(user2).deposit(ethers.parseEther("500"));
      await veAeth.connect(user2).delegate(user2.address);

      encodedFunctionCall = aeth.interface.encodeFunctionData("burn", [ethers.parseEther("1")]);
    });

    it("Should FAIL to create proposal if veAETH balance is below Threshold (Anti-Spam)", async function () {
      await expect(
        governor.connect(user2).propose([await aeth.getAddress()], [0], [encodedFunctionCall], description)
      ).to.be.reverted;
    });

    it("Should SUCCESS create proposal & voting with Testnet duration", async function () {
      await governor.connect(user1).propose([await aeth.getAddress()], [0], [encodedFunctionCall], description);
      const proposalId = await governor.hashProposal([await aeth.getAddress()], [0], [encodedFunctionCall], ethers.keccak256(ethers.toUtf8Bytes(description)));

      await mine(200);
      let state = await governor.state(proposalId);
      expect(state).to.equal(1n);

      await governor.connect(user1).castVote(proposalId, 1);
      await mine(700);
      state = await governor.state(proposalId);
      expect(state).to.equal(4n);
    });
  });
});