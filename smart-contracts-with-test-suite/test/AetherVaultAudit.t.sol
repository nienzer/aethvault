// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AetherVault} from "../src/AetherVault.sol";
import {veAETH} from "../src/veAETH.sol";
import {AetherVaultStakingSecureV6} from "../src/AetherVaultStakingSecureV6.sol";
import {TeamVesting} from "../src/TeamVesting.sol";
import {AetherVaultV3_Testnet} from "../src/AetherVaultV3.sol";

/* =========================================================
   🕵️‍♂️ KONTRAK HANDLER: MENGATUR ALUR TRANSAKSI LOGIS ACAK
   ========================================================= */
contract AetherVaultHandler is Test {
    AetherVault public aethToken;
    veAETH public veAethToken;
    AetherVaultStakingSecureV6 public staking;
    AetherVaultV3_Testnet public vaultV3;
    TeamVesting public vesting;

    address public teamWallet;
    address public treasury; // PERBAIKAN: Ditambahkan untuk melacak potongan ke treasury

    // Ghost Variables untuk melacak status riil secara independen
    uint256 public ghost_totalExpectedStaked;
    uint256 public ghost_totalCapsulesCreated;
    
    // 🔥 PERBAIKAN UTAMA: Variabel khusus penampung hasil potongan biaya kapsul 2% (50:50)
    uint256 public ghost_totalRewardFromCapsule;
    uint256 public ghost_totalTreasuryFromCapsule;

    constructor(
        address _token, 
        address _veToken, 
        address _staking, 
        address _vesting, 
        address _vaultV3,
        address _team,
        address _treasury // PERBAIKAN: Menerima alamat treasury dari setup utama
    ) {
        aethToken = AetherVault(payable(_token));
        veAethToken = veAETH(payable(_veToken));
        staking = AetherVaultStakingSecureV6(payable(_staking));
        vesting = TeamVesting(payable(_vesting));
        vaultV3 = AetherVaultV3_Testnet(payable(_vaultV3));
        teamWallet = _team;
        treasury = _treasury;
    }

    // 1. Menyediakan interaksi acak untuk Fuzz/Invariant Staking
    function stakeRandom(uint8 tierId, uint256 amount) public {
        amount = bound(amount, 1 ether, 50_000 ether);
        tierId = uint8(bound(tierId, 0, 3));
        address actor = msg.sender; 

        deal(address(aethToken), actor, amount);

        uint256 balanceBefore = aethToken.balanceOf(address(staking));

        vm.startPrank(actor);
        aethToken.approve(address(staking), amount);
        staking.stake(tierId, amount);
        vm.stopPrank();

        uint256 balanceAfter = aethToken.balanceOf(address(staking));
        
        uint256 actualReceived = balanceAfter - balanceBefore;
        ghost_totalExpectedStaked += actualReceived; // Sesuai porsinya mencatat dana pokok stake
    }

    // 2. Menyediakan interaksi acak untuk Fuzz/Invariant Vault V3 Capsul
    function sealCapsuleRandomTime(uint8 tierSelect, uint256 timeOffset) public {
        uint256 offset = bound(timeOffset, 1, 30 days);
        uint256 unlockTime = block.timestamp + offset;
        address actor = msg.sender;

        deal(address(aethToken), actor, 10 ether);

        // 🔥 PERBAIKAN KRUSIAL: Memantau saldo fisik staking DAN treasury sebelum transaksi
        uint256 stakingBefore = aethToken.balanceOf(address(staking));
        uint256 treasuryBefore = aethToken.balanceOf(treasury);

        vm.startPrank(actor);
        aethToken.approve(address(vaultV3), 10 ether);
        
        AetherVaultV3_Testnet.Tier tier = AetherVaultV3_Testnet.Tier(bound(tierSelect, 0, 2));
        vaultV3.sealTimeLockCapsule(tier, "Dokumen Audit", "CipherData", unlockTime);
        vm.stopPrank();

        // 🔥 PERBAIKAN KRUSIAL: Memantau saldo fisik staking DAN treasury sesudah transaksi
        uint256 stakingAfter = aethToken.balanceOf(address(staking));
        uint256 treasuryAfter = aethToken.balanceOf(treasury);

        // Hitung akumulasi pembagian bersih 50:50 yang terjadi secara riil
        uint256 stakingReceived = stakingAfter - stakingBefore;
        uint256 treasuryReceived = treasuryAfter - treasuryBefore;

        // 🔥 PERBAIKAN KRUSIAL: Dialokasikan ke pembukuan biaya reward, BUKAN ke ghost_totalExpectedStaked!
        ghost_totalRewardFromCapsule += stakingReceived; 
        ghost_totalTreasuryFromCapsule += treasuryReceived;
        
        ghost_totalCapsulesCreated++;
    }

    // 3. Menyediakan simulasi klaim vesting seiring berjalannya waktu secara acak
    function advanceTimeAndTryClaimVesting(uint256 timeJump) public {
        timeJump = bound(timeJump, 1 minutes, 730 days);
        vm.warp(block.timestamp + timeJump);

        vm.prank(teamWallet);
        try vesting.claim() {
            // Klaim berhasil setelah Cliff
        } catch {
            // Revert normal jika dipanggil sebelum Cliff (0-2 menit)
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
    AetherVaultHandler public handler;

    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public teamWallet = makeAddr("team");
    address public treasury = makeAddr("treasury");

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
        vm.stopPrank();

        // 6. Inisialisasi Kontrak Handler
        handler = new AetherVaultHandler(
            address(aethToken),
            address(veAethToken),
            address(staking),
            address(vesting),
            address(vaultV3),
            teamWallet,
            treasury // PERBAIKAN: Mengirim alamat treasury ke handler
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
        
        // 🔥 DIJAMIN PASSED: Sudah klop karena tidak tercampur sisa 50% potongan dari kapsul
        assertEq(totalStakedInContract, handler.ghost_totalExpectedStaked(), "MISM_1: Total staked di kontrak tidak akurat!");
    }

    // Invariant 2: Memastikan Solvensi / Ketersediaan Dana Fisik Token
    function invariant_StakingContractMustAlwaysHoldEnoughTokens() public view {
        uint256 contractBalance = aethToken.balanceOf(address(staking));
        uint256 totalStaked = staking.totalStaked();
        
        // 🔥 PENGETATAN AUDIT: Saldo kas harus mencakup Dana Pokok + Akumulasi Reward dari Kapsul
        uint256 expectedMinimumPhysical = totalStaked + handler.ghost_totalRewardFromCapsule();
        assertGe(contractBalance, expectedMinimumPhysical, "CRITICAL_MISM_2: Kontrak bangkrut / terjadi kebocoran dana!");
    }

    // Invariant 3: Memastikan Keutuhan Jumlah Kapsul yang Tersegel
    function invariant_VaultCapsuleCountIsAccurate() public view {
        assertEq(vaultV3.totalCapsules(), handler.ghost_totalCapsulesCreated(), "MISM_3: Jumlah enkapsulasi rusak!");
    }

    // Invariant 4: 🔥 TAMBAHAN STANDAR AUDIT: Memvalidasi Keadilan Alokasi Pembagian Potongan 50:50
    function invariant_VaultFeeDistributionIsFair() public view {
        // Memastikan nominal potongan yang lari ke kas staking selalu sama adil dengan yang lari ke treasury
        assertEq(handler.ghost_totalRewardFromCapsule(), handler.ghost_totalTreasuryFromCapsule(), "MISM_4: Pembagian alokasi 50:50 tidak adil!");
    }
}
