// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console} from "forge-std/Test.sol";

// 📦 IMPORT ENTIRE AETHERVAULT ECOSYSTEM
import {AetherVault} from "../src/AetherVault.sol";
import {veAETH} from "../src/veAETH.sol";
import {AetherGovernor} from "../src/AetherGovernor.sol";
import {AetherVaultStakingSecureV6} from "../src/AetherVaultStakingSecureV6.sol";
import {TeamVesting} from "../src/TeamVesting.sol";
import {AetherVaultV3_Testnet} from "../src/AetherVaultV3.sol";
import {AetherForgeFactory, AetherChildToken} from "../src/AetherForgeFactory.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract AetherVaultEcosystemTest is Test {
    // 🏗️ Declare Core Contracts
    AetherVault public aethToken;
    veAETH public veAethToken;
    AetherGovernor public governor;
    AetherVaultStakingSecureV6 public staking;
    TeamVesting public vesting;
    AetherVaultV3_Testnet public vaultV3;
    AetherForgeFactory public forge;

    // 🎭 Declare Actors (Wallet Addresses)
    address public owner = makeAddr("owner");
    address public initialLiquidity = makeAddr("liquidity");
    address public stakingRewards = makeAddr("staking_rewards");
    address public initialSale = makeAddr("sale");
    address public teamWallet = makeAddr("team");
    address public treasury = makeAddr("treasury");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    // 💰 Konstanta Biaya
    uint256 public constant FORGE_CREATION_FEE = 1000 * 10**18;

    function setUp() public {
        vm.startPrank(owner);
        
        // 1️⃣ DEPLOY TOKEN (100 Million AETH)
        aethToken = new AetherVault(
            initialLiquidity, 
            stakingRewards, 
            initialSale, 
            teamWallet, 
            treasury
        );

        // 2️⃣ DEPLOY DAO TOKEN (veAETH - Soulbound)
        veAethToken = new veAETH(address(aethToken));

        // 3️⃣ DEPLOY GOVERNOR (DAO System)
        governor = new AetherGovernor(IVotes(address(veAethToken)));

        // 4️⃣ DEPLOY STAKING V6
        staking = new AetherVaultStakingSecureV6(address(aethToken));

        // 5️⃣ DEPLOY TEAM VESTING (15 Million AETH Allocation)
        uint256 vestingAllocation = 15_000_000 * 10**18;
        vesting = new TeamVesting(
            address(aethToken), 
            teamWallet, 
            block.timestamp, 
            vestingAllocation
        );

        // 6️⃣ DEPLOY VAULT V3 (Time Capsule & Copyright)
        vaultV3 = new AetherVaultV3_Testnet(
            address(aethToken), 
            treasury, 
            address(staking)
        );

        // 7️⃣ DEPLOY AETHER FORGE FACTORY
        forge = new AetherForgeFactory(
            address(aethToken), 
            treasury, 
            address(staking),
            FORGE_CREATION_FEE
        );

        vm.stopPrank();

        // 🟢 TRANSFER ALOKASI VESTING
        vm.startPrank(teamWallet);
        aethToken.transfer(address(vesting), 15_000_000 * 10**18);
        vm.stopPrank();

        // 💰 Fund Users
        deal(address(aethToken), user1, 10_000 * 10**18);
        deal(address(aethToken), user2, 10_000 * 10**18);
    }

    /* =========================================================
       🟢 MODULE 1: AETHERVAULT TOKEN (5 Tests)
       ========================================================= */
    function test_Token_InitialSupplyIsCorrect() public view {
        assertEq(aethToken.totalSupply(), 100_000_000 * 10**18, "Supply salah");
    }

    function test_Token_BalancesDistributedCorrectly() public view {
        assertTrue(aethToken.balanceOf(initialLiquidity) > 0, "Liquidity kosong");
        assertTrue(aethToken.balanceOf(stakingRewards) > 0, "Staking reserve kosong");
    }

    function test_Token_StandardTransfer() public {
        vm.startPrank(user1);
        aethToken.transfer(user2, 100 * 10**18);
        assertEq(aethToken.balanceOf(user2), 10_100 * 10**18);
        vm.stopPrank();
    }

    function test_Token_ApproveAndTransferFrom() public {
        vm.prank(user1);
        aethToken.approve(owner, 500 * 10**18);
        
        vm.prank(owner);
        aethToken.transferFrom(user1, user2, 500 * 10**18);
        assertEq(aethToken.balanceOf(user2), 10_500 * 10**18);
    }

    function test_RevertWhen_Token_TransferExceedsBalance() public {
        vm.prank(user1);
        vm.expectRevert(); 
        aethToken.transfer(user2, 999_000_000 * 10**18); 
    }

    /* =========================================================
       🟡 MODULE 2: AETHERVAULT V3 CAPSULE (6 Tests)
       ========================================================= */
    function test_Vault_BindToAethToken() public view {
        assertEq(address(vaultV3.aethToken()), address(aethToken));
    }

    function test_Vault_SealCapsuleBasic() public {
        vm.startPrank(user1);
        uint256 cost = 10 * 10**18; 
        aethToken.approve(address(vaultV3), cost);
        vaultV3.sealTimeLockCapsule(
            AetherVaultV3_Testnet.Tier.Basic, 
            "Doc", 
            "data", 
            block.timestamp + 100
        );
        vm.stopPrank();
    }

    function test_Vault_SealCapsuleMultipleUsers() public {
        vm.startPrank(user1);
        aethToken.approve(address(vaultV3), 10 * 10**18);
        vaultV3.sealTimeLockCapsule(AetherVaultV3_Testnet.Tier.Basic, "Doc1", "data", block.timestamp + 100);
        vm.stopPrank();

        vm.startPrank(user2);
        aethToken.approve(address(vaultV3), 10 * 10**18);
        vaultV3.sealTimeLockCapsule(AetherVaultV3_Testnet.Tier.Basic, "Doc2", "data", block.timestamp + 100);
        vm.stopPrank();
    }

    function test_RevertWhen_Vault_SealWithoutApproval() public {
        vm.prank(user1);
        vm.expectRevert();
        vaultV3.sealTimeLockCapsule(AetherVaultV3_Testnet.Tier.Basic, "Doc", "data", block.timestamp + 100);
    }

    function test_RevertWhen_Vault_SealInThePast() public {
        vm.warp(1000); // 🟢 Mencegah underflow
        vm.startPrank(user1);
        aethToken.approve(address(vaultV3), 10 * 10**18);
        vm.expectRevert();
        vaultV3.sealTimeLockCapsule(AetherVaultV3_Testnet.Tier.Basic, "Doc", "data", block.timestamp - 100);
        vm.stopPrank();
    }

    function test_Vault_StakingTreasuryAddressBinding() public view {
        assertEq(vaultV3.treasuryAddress(), treasury);
    }

    /* =========================================================
       🔵 MODULE 3: STAKING V6 (7 Tests)
       ========================================================= */
    function test_Staking_BindToAethToken() public view {
        assertEq(address(staking.aethToken()), address(aethToken));
    }

    function test_Staking_StakeTierZero() public {
        vm.startPrank(user1);
        aethToken.approve(address(staking), 500 * 10**18);
        staking.stake(0, 500 * 10**18);
        vm.stopPrank();
    }

    function test_Staking_TotalStakedUpdatesCorrectly() public {
        vm.startPrank(user1);
        aethToken.approve(address(staking), 100 * 10**18);
        staking.stake(0, 100 * 10**18);
        vm.stopPrank();
        assertEq(staking.totalStaked(), 100 * 10**18);
    }

    function test_Staking_StakeMultipleUsers() public {
        vm.startPrank(user1);
        aethToken.approve(address(staking), 100 * 10**18);
        staking.stake(0, 100 * 10**18);
        vm.stopPrank();

        vm.startPrank(user2);
        aethToken.approve(address(staking), 200 * 10**18);
        staking.stake(0, 200 * 10**18);
        vm.stopPrank();

        assertEq(staking.totalStaked(), 300 * 10**18);
    }

    function test_RevertWhen_Staking_ZeroAmount() public {
        vm.startPrank(user1);
        aethToken.approve(address(staking), 10 * 10**18);
        vm.expectRevert();
        staking.stake(0, 0);
        vm.stopPrank();
    }

    function test_RevertWhen_Staking_WithoutApproval() public {
        vm.prank(user1);
        vm.expectRevert();
        staking.stake(0, 100 * 10**18);
    }

    function test_Staking_ContractHoldsTokens() public {
        vm.startPrank(user1);
        aethToken.approve(address(staking), 100 * 10**18);
        staking.stake(0, 100 * 10**18);
        vm.stopPrank();
        assertTrue(aethToken.balanceOf(address(staking)) >= 100 * 10**18);
    }

    /* =========================================================
       🟣 MODULE 4: TEAM VESTING (7 Tests)
       ========================================================= */
    function test_Vesting_TotalAllocatedIsFixed() public view {
        assertEq(vesting.totalAllocated(), 15_000_000 * 10**18);
    }

    function test_Vesting_BeneficiaryIsTeam() public view {
        assertEq(vesting.beneficiary(), teamWallet);
    }

    function test_Vesting_CliffCheckIsZeroInitially() public view {
        assertEq(vesting.claimableAmount(), 0);
    }

    function test_RevertWhen_Vesting_NotBeneficiary() public {
        vm.prank(user1);
        vm.expectRevert();
        vesting.claim();
    }

    function test_RevertWhen_Vesting_ClaimBeforeCliff() public {
        vm.prank(teamWallet);
        vm.expectRevert();
        vesting.claim();
    }

    function test_Vesting_TimeAdvanceIncrementsClaimable() public {
        skip(365 days); // Maju 1 tahun
        assertTrue(vesting.claimableAmount() > 0, "Claimable harus bertambah");
    }

    function test_Vesting_ContractHoldsAllocation() public view {
        assertEq(aethToken.balanceOf(address(vesting)), 15_000_000 * 10**18, "Saldo vesting tidak sesuai alokasi");
    }

    /* =========================================================
       🟤 MODULE 5: DAO GOVERNANCE & veAETH (5 Tests)
       ========================================================= */
    function test_veAETH_BindToAethToken() public view {
        assertEq(address(veAethToken.aethToken()), address(aethToken));
    }

    function test_veAETH_DepositAndMintSoulbound() public {
        vm.startPrank(user1);
        aethToken.approve(address(veAethToken), 200 * 10**18);
        veAethToken.deposit(200 * 10**18);
        assertEq(veAethToken.balanceOf(user1), 200 * 10**18);
        vm.stopPrank();
    }

    function test_RevertWhen_veAETH_TransferSoulbound() public {
        vm.startPrank(user1);
        aethToken.approve(address(veAethToken), 200 * 10**18);
        veAethToken.deposit(200 * 10**18);
        
        vm.expectRevert(); // Tidak bisa ditransfer
        veAethToken.transfer(user2, 100 * 10**18);
        vm.stopPrank();
    }

    function test_Governor_VotingDelayIsCorrect() public view {
        assertEq(governor.votingDelay(), 3 minutes);
    }

    function test_Governor_TokenBindingIsCorrect() public view {
        assertEq(address(governor.token()), address(veAethToken));
    }

    /* =========================================================
       🟠 MODULE 6: AETHER FORGE FACTORY (5 Tests)
       ========================================================= */
    function test_Forge_InitialConfig() public view {
        assertEq(forge.treasuryAddress(), treasury);
        assertEq(forge.stakingContractAddress(), address(staking));
        assertEq(forge.creationFee(), FORGE_CREATION_FEE);
    }

    function test_Forge_CreateTokenSuccess() public {
        uint256 treasuryBalanceBefore = aethToken.balanceOf(treasury);
        uint256 stakingBalanceBefore = aethToken.balanceOf(address(staking));
        uint256 totalBurnedBefore = aethToken.totalBurnedAeth();
        uint256 supply = 1_000_000;

        vm.startPrank(user1);
        aethToken.approve(address(forge), FORGE_CREATION_FEE);
        
        address newTokenAddr = forge.createMyOwnToken("Test Token", "TST", supply);
        vm.stopPrank();

        // 🟢 Verifikasi distribusi 50:50 dan Burn 2% SUPER LENGKAP
        uint256 burnAmount = (FORGE_CREATION_FEE * 2) / 100;
        uint256 remaining = FORGE_CREATION_FEE - burnAmount;
        uint256 expectedShare = remaining / 2;

        assertEq(aethToken.totalBurnedAeth() - totalBurnedBefore, burnAmount, "Burn tidak tercatat di Vault");
        assertEq(aethToken.balanceOf(address(staking)) - stakingBalanceBefore, expectedShare, "Bagian staking tidak sesuai");
        assertEq(aethToken.balanceOf(treasury) - treasuryBalanceBefore, expectedShare, "Bagian treasury tidak sesuai");

        assertTrue(forge.isVerifiedForgeToken(newTokenAddr), "Token tidak diverifikasi");
        AetherChildToken childToken = AetherChildToken(newTokenAddr);
        assertEq(childToken.balanceOf(user1), supply * 10**childToken.decimals(), "Supply pencipta tidak sesuai");
    }

    function test_RevertWhen_Forge_CreateTokenWithoutApprove() public {
        vm.prank(user1);
        vm.expectRevert(); 
        forge.createMyOwnToken("Fail Token", "FAIL", 1_000_000);
    }

    function test_RevertWhen_Forge_CreateTokenWithInvalidParams() public {
        vm.startPrank(user1);
        aethToken.approve(address(forge), FORGE_CREATION_FEE);
        vm.expectRevert("Nama tidak valid");
        forge.createMyOwnToken("", "FAIL", 1000);
        vm.stopPrank();
    }

    function test_Forge_AdminUpdateFeeAndRecipients() public {
        vm.startPrank(owner);
        uint256 newFee = 2000 * 10**18;
        forge.setFee(newFee);
        assertEq(forge.creationFee(), newFee);

        forge.setRecipients(user2, address(staking));
        assertEq(forge.treasuryAddress(), user2);
        vm.stopPrank();
    }
}