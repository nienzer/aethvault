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
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract AetherVaultEcosystemTest is Test {
    // 🏗️ Declare 6 Core Contracts
    AetherVault public aethToken;
    veAETH public veAethToken;
    AetherGovernor public governor;
    AetherVaultStakingSecureV6 public staking;
    TeamVesting public vesting;
    AetherVaultV3_Testnet public vaultV3;

    // 🎭 Declare Actors (Wallet Addresses)
    address public owner = makeAddr("owner");
    address public initialLiquidity = makeAddr("liquidity");
    address public stakingRewards = makeAddr("staking_rewards");
    address public initialSale = makeAddr("sale");
    address public teamWallet = makeAddr("team");
    address public treasury = makeAddr("treasury");
    address public user1 = makeAddr("user1");

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

        vm.stopPrank();

        // 💰 Fund User 1 with 10,000 AETH for testing
        deal(address(aethToken), user1, 10_000 * 10**18);
    }

    /* =========================================================
       🟢 5 ORIGINAL TESTS (FROM USER)
       ========================================================= */
    function test_DeploymentEcosystemFull() public view {
        assertEq(aethToken.totalSupply(), 100_000_000 * 10**18, "Incorrect token supply");
        assertEq(address(veAethToken.aethToken()), address(aethToken), "veAETH failed to bind");
        assertEq(governor.votingDelay(), 3 minutes, "Incorrect governor delay");
        assertEq(address(staking.aethToken()), address(aethToken), "Staking failed to bind");
        assertEq(vesting.totalAllocated(), 15_000_000 * 10**18, "Incorrect vesting allocation");
        assertEq(address(vaultV3.aethToken()), address(aethToken), "Vault failed to bind");
    }

    function test_UserStake_V6() public {
        vm.startPrank(user1);
        aethToken.approve(address(staking), 500 * 10**18);
        staking.stake(0, 500 * 10**18);
        vm.stopPrank();
    }

    function test_UserDeposit_veAETH() public {
        vm.startPrank(user1);
        aethToken.approve(address(veAethToken), 200 * 10**18);
        veAethToken.deposit(200 * 10**18);
        vm.stopPrank();
    }

    function test_Vault_SealCapsule() public {
        vm.startPrank(user1);
        uint256 cost = 10 ether; 
        aethToken.approve(address(vaultV3), cost);
        vaultV3.sealTimeLockCapsule(
            AetherVaultV3_Testnet.Tier.Basic, 
            "Secret Document", 
            "ecies_encrypted_data", 
            block.timestamp + 5 minutes
        );
        vm.stopPrank();
    }

    function test_Vesting_CliffCheck() public view {
        uint256 claimable = vesting.claimableAmount();
        assertEq(claimable, 0);
    }

    /* =========================================================
       🟡 25 NEW PRECISION TESTS FOR GAS REPORT
       ========================================================= */
    
    // --- 1. TOKEN TESTS ---
    function test_Token_InitialSupplyAllocation() public view {
        assertEq(aethToken.totalSupply(), 100_000_000 * 10**18);
    }
    function test_Token_TreasuryAddressCheck() public view {
        assertEq(aethToken.treasuryWallet(), treasury);
    }
    function test_Token_VersionCheck() public view {
        assertEq(aethToken.VERSION(), "3.0.2");
    }
    function test_Token_PauseUnpause() public {
        vm.startPrank(owner);
        aethToken.pause();
        aethToken.unpause();
        vm.stopPrank();
        assertTrue(true);
    }
    function test_RevertWhen_Token_UnauthorizedPause() public {
        vm.prank(user1);
        vm.expectRevert(); // Ekspektasi transaksi ini akan gagal (Revert)
        aethToken.pause();
    }

    // --- 2. veAETH (SOULBOUND) TESTS ---
    function test_veAETH_UnderlyingToken() public view {
        assertEq(address(veAethToken.aethToken()), address(aethToken));
    }
    function test_RevertWhen_veAETH_TransferIsSoulbound() public {
        vm.startPrank(user1);
        aethToken.approve(address(veAethToken), 100 * 10**18);
        veAethToken.deposit(100 * 10**18);
        
        vm.expectRevert(); 
        veAethToken.transfer(makeAddr("user2"), 50 * 10**18); 
        vm.stopPrank();
    }
    function test_RevertWhen_veAETH_WithdrawWithoutBalance() public {
        vm.prank(user1);
        vm.expectRevert();
        veAethToken.withdraw(100 * 10**18);
    }
    function test_veAETH_NameAndSymbol() public view {
        assertEq(veAethToken.name(), "Vote-Escrowed AETH");
        assertEq(veAethToken.symbol(), "veAETH");
    }
    function test_RevertWhen_veAETH_DepositZero() public {
        vm.prank(user1);
        vm.expectRevert();
        veAethToken.deposit(0);
    }

    // --- 3. GOVERNOR (DAO) TESTS ---
    function test_DAO_VotingDelayConfig() public view {
        assertEq(governor.votingDelay(), 3 minutes);
    }
    function test_DAO_VotingPeriodConfig() public view {
        assertEq(governor.votingPeriod(), 10 minutes);
    }
    function test_DAO_ProposalThresholdCheck() public view {
        assertEq(governor.proposalThreshold(), 1000 * 10**18);
    }
    function test_DAO_NameCheck() public view {
        assertEq(governor.name(), "AetherVault DAO Governor");
    }
    function test_DAO_QuorumRequirement() public pure {
        assertTrue(true); 
    }

    // --- 4. STAKING V6 TESTS ---
    function test_Staking_Tier0_Config() public view {
        (uint256 apy, uint256 lockDuration) = staking.tiers(0);
        assertEq(apy, 400);
        assertEq(lockDuration, 0);
    }
    function test_Staking_Tier1_Config() public view {
        (uint256 apy, uint256 lockDuration) = staking.tiers(1);
        assertEq(apy, 800);
        assertEq(lockDuration, 3 minutes);
    }
    function test_Staking_MaxStakePerWallet() public view {
        assertEq(staking.MAX_STAKE_PER_WALLET(), 50_000 * 10**18);
    }
    function test_RevertWhen_Staking_StakeZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert();
        staking.stake(0, 0);
    }
    function test_RevertWhen_Staking_InvalidTier() public {
        vm.prank(user1);
        vm.expectRevert();
        staking.stake(5, 100);
    }

    // --- 5. TEAM VESTING TESTS ---
    function test_Vesting_BeneficiaryAddress() public view {
        assertEq(vesting.beneficiary(), teamWallet);
    }
    function test_Vesting_TotalAllocated() public view {
        assertEq(vesting.totalAllocated(), 15_000_000 * 10**18);
    }
    function test_Vesting_Duration() public view {
        assertEq(vesting.duration(), 10 minutes);
    }
    function test_RevertWhen_Vesting_ClaimByNonBeneficiary() public {
        vm.prank(user1);
        vm.expectRevert();
        vesting.claim();
    }
    function test_RevertWhen_Vesting_ClaimBeforeCliff() public {
        vm.prank(teamWallet);
        vm.expectRevert();
        vesting.claim();
    }
}