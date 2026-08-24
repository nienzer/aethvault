// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AetherVault} from "../src/AetherVault.sol";
import {veAETH} from "../src/veAETH.sol";
import {AetherVaultStakingSecureV6} from "../src/AetherVaultStakingSecureV6.sol";
import {TeamVesting} from "../src/TeamVesting.sol";
import {AetherVaultV3_Testnet} from "../src/AetherVaultV3.sol";
import {AetherForgeFactory as AetherForge} from "../src/AetherForgeFactory.sol";

/* =========================================================
   🕵️‍♂️ KONTRAK HANDLER: MENGATUR ALUR TRANSAKSI LOGIS ACAK
   ========================================================= */
contract AetherVaultHandler is Test {
    AetherVault public aethToken;
    veAETH public veAethToken;
    AetherVaultStakingSecureV6 public staking;
    AetherVaultV3_Testnet public vaultV3;
    TeamVesting public vesting;
    AetherForge public forge; 

    address public teamWallet;
    address public treasury; 

    // Ghost Variables untuk melacak status riil secara independen
    uint256 public ghost_totalExpectedStaked;
    uint256 public ghost_totalCapsulesCreated;
    uint256 public ghost_totalTokensForged; 
    
    uint256 public ghost_totalRewardFromCapsule;
    uint256 public ghost_totalTreasuryFromCapsule;

    constructor(
        address _token, 
        address _veToken, 
        address _staking, 
        address _vesting, 
        address _vaultV3,
        address _forge, 
        address _team,
        address _treasury 
    ) {
        aethToken = AetherVault(payable(_token));
        veAethToken = veAETH(payable(_veToken));
        staking = AetherVaultStakingSecureV6(payable(_staking));
        vesting = TeamVesting(payable(_vesting));
        vaultV3 = AetherVaultV3_Testnet(payable(_vaultV3));
        forge = AetherForge(payable(_forge)); 
        teamWallet = _team;
        treasury = _treasury;
    }

    // 1. Menyediakan interaksi acak untuk Fuzz/Invariant Staking
    function stakeRandom(uint8 tierId, uint256 amount) public {
        address actor = msg.sender; 
        if (actor == address(staking) || actor == address(vaultV3) || actor == address(forge) || actor == treasury || actor == address(aethToken)) return;

        amount = bound(amount, 1 ether, 50_000 ether);
        tierId = uint8(bound(tierId, 0, 3));

        deal(address(aethToken), actor, amount);

        uint256 balanceBefore = aethToken.balanceOf(address(staking));

        vm.startPrank(actor);
        aethToken.approve(address(staking), amount);
        
        try staking.stake(tierId, amount) {
            uint256 balanceAfter = aethToken.balanceOf(address(staking));
            uint256 actualReceived = balanceAfter - balanceBefore;
            ghost_totalExpectedStaked += actualReceived; 
        } catch {
            // Revert diredam jika tier dikunci atau kondisi internal kontrak tidak terpenuhi
        }
        vm.stopPrank();
    }

    // 2. Menyediakan interaksi acak untuk Fuzz/Invariant Vault V3 Capsul
    function sealCapsuleRandomTime(uint8 tierSelect, uint256 timeOffset) public {
        address actor = msg.sender;
        if (actor == address(staking) || actor == address(vaultV3) || actor == address(forge) || actor == treasury || actor == address(aethToken)) return;

        uint256 offset = bound(timeOffset, 1 hours, 30 days);
        uint256 unlockTime = block.timestamp + offset;

        deal(address(aethToken), actor, 10 ether);

        uint256 stakingBefore = aethToken.balanceOf(address(staking));
        uint256 treasuryBefore = aethToken.balanceOf(treasury);

        vm.startPrank(actor);
        aethToken.approve(address(vaultV3), 10 ether);
        
        AetherVaultV3_Testnet.Tier tier = AetherVaultV3_Testnet.Tier(bound(tierSelect, 0, 2));
        
        try vaultV3.sealTimeLockCapsule(tier, "Dokumen Audit", "CipherData", unlockTime) {
            uint256 stakingAfter = aethToken.balanceOf(address(staking));
            uint256 treasuryAfter = aethToken.balanceOf(treasury);

            uint256 stakingReceived = stakingAfter - stakingBefore;
            uint256 treasuryReceived = treasuryAfter - treasuryBefore;

            ghost_totalRewardFromCapsule += stakingReceived; 
            ghost_totalTreasuryFromCapsule += treasuryReceived;
            
            ghost_totalCapsulesCreated++;
        } catch {
            // Revert diredam jika validasi internal unlockTime gagal
        }
        vm.stopPrank();
    }

    // 3. Simulasi Pembuatan Token Acak via Forge Factory (Mengambil creationFee secara dinamis)
    function forgeTokenRandom(string memory name, string memory symbol, uint256 initialSupply) public {
        address actor = msg.sender;
        if (actor == address(staking) || actor == address(vaultV3) || actor == address(forge) || actor == treasury || actor == address(aethToken)) return;

        initialSupply = bound(initialSupply, 1_000 * 10**18, 1_000_000 * 10**18);

        // Mengambil creationFee secara dinamis dari kontrak forge (1,000 AETH)
        uint256 creationFee = forge.creationFee();
        deal(address(aethToken), actor, creationFee);

        vm.startPrank(actor);
        aethToken.approve(address(forge), creationFee);
        try forge.createMyOwnToken(name, symbol, initialSupply) {
            ghost_totalTokensForged++;
        } catch {
            // Revert aman jika parameter tidak valid
        }
        vm.stopPrank();
    }

    // 4. Menyediakan simulasi klaim vesting seiring berjalannya waktu secara acak
    function advanceTimeAndTryClaimVesting(uint256 timeJump) public {
        timeJump = bound(timeJump, 5 minutes, 30 days);
        vm.warp(block.timestamp + timeJump);

        vm.prank(teamWallet);
        try vesting.claim() {
            // Klaim berhasil setelah Cliff
        } catch {
            // Revert diredam jika dipanggil sebelum Cliff atau alokasi dana sudah habis diserap
        }
    }
}

/* =========================================================
   🛡️ KONTRAK UTAMA AUDIT (FOUNDRY TEST SUITE)
   ========================================================= */
contract AetherVaultAuditTest is Test {
    AetherVault public aethToken;
    veAETH public veAethToken;
    AetherVaultStakingSecureV6 public staking;
    TeamVesting public vesting;
    AetherVaultV3_Testnet public vaultV3;
    AetherForge public forge; 
    AetherVaultHandler public handler;

    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public teamWallet = makeAddr("team");
    address public treasury = makeAddr("treasury");

    // Konstanta Fee Forge (1,000 AETH)
    uint256 public constant FORGE_CREATION_FEE = 1000 * 10**18;

    function setUp() public {
        vm.startPrank(owner);
        // 1. Deploy Token
        aethToken = new AetherVault(makeAddr("l"), makeAddr("s"), makeAddr("i"), teamWallet, treasury);
        
        // 2. Deploy veAETH
        veAethToken = new veAETH(address(aethToken));

        // 3. Deploy Staking
        staking = new AetherVaultStakingSecureV6(address(aethToken));
        
        // 4. Deploy Vesting (Cliff: 3 Menit)
        vesting = new TeamVesting(address(aethToken), teamWallet, block.timestamp, 15_000_000 * 10**18);

        // 5. Deploy Vault V3
        vaultV3 = new AetherVaultV3_Testnet(address(aethToken), treasury, address(staking));

        // 6. Deploy AetherForge Factory (Disesuaikan dengan 4 parameter: Token, Treasury, Staking, Fee)
        forge = new AetherForge(address(aethToken), treasury, address(staking), FORGE_CREATION_FEE);

        vm.stopPrank();

        // 7. Inisialisasi Kontrak Handler dengan menyertakan alamat forge
        handler = new AetherVaultHandler(
            address(aethToken),
            address(veAethToken),
            address(staking),
            address(vesting),
            address(vaultV3),
            address(forge), 
            teamWallet,
            treasury 
        );

        targetContract(address(handler));
    }

    /* =========================================================
       🌪️ FUZZ TESTING: veAETH (SOULBOUND VALIDATION)
       ========================================================= */
    function testFuzz_veAETH_IsSoulboundAndCannotBeTransferred(uint256 amount, address target) public {
        amount = bound(amount, 1, 100_000 * 10**18);
        vm.assume(target != address(0) && target != user1);

        vm.startPrank(user1);
        deal(address(aethToken), user1, amount);
        aethToken.approve(address(veAethToken), amount);
        veAethToken.deposit(amount);
        
        vm.expectRevert();
        veAethToken.transfer(target, amount);
        vm.stopPrank();
    }

    /* =========================================================
       🛡️ INVARIANT TESTING (STRICT ACCURATE ASSERTIONS)
       ========================================================= */
    
    // Invariant 1: Memastikan akuntansi matematis Staking benar secara mutlak
    function invariant_StakingMathIsPerfect() public view {
        uint256 totalStakedInContract = staking.totalStaked();
        assertEq(totalStakedInContract, handler.ghost_totalExpectedStaked(), "MISM_1: Total staked di kontrak tidak akurat!");
    }

    // Invariant 2: Memastikan Solvensi / Ketersediaan Dana Fisik Token
    function invariant_StakingContractMustAlwaysHoldEnoughTokens() public view {
        uint256 contractBalance = aethToken.balanceOf(address(staking));
        uint256 totalStaked = staking.totalStaked();
        uint256 expectedMinimumPhysical = totalStaked + handler.ghost_totalRewardFromCapsule();
        assertGe(contractBalance, expectedMinimumPhysical, "CRITICAL_MISM_2: Kontrak bangkrut / terjadi kebocoran dana!");
    }

    // Invariant 3: Memastikan Keutuhan Jumlah Kapsul yang Tersegel
    function invariant_VaultCapsuleCountIsAccurate() public view {
        assertEq(vaultV3.totalCapsules(), handler.ghost_totalCapsulesCreated(), "MISM_3: Jumlah enkapsulasi rusak!");
    }

    // Invariant 4: Memvalidasi Keadilan Alokasi Pembagian Potongan 50:50
    function invariant_VaultFeeDistributionIsFair() public view {
        assertEq(handler.ghost_totalRewardFromCapsule(), handler.ghost_totalTreasuryFromCapsule(), "MISM_4: Pembagian alokasi 50:50 tidak adil!");
    }
}