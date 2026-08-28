// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";
import "../src/AethVaultFaucetV3.sol"; 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ==========================================
// 1. MOCK TOKEN (Koin Normal buat Umpan)
// ==========================================
contract MockToken is ERC20 {
    constructor() ERC20("TestToken", "TST") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// ==========================================
// 2. HACKER TOKEN (Malware Pembawa Petaka)
// ==========================================
contract HackerToken is ERC20 {
    AethVaultFaucetV3 public targetFaucet;
    uint256 public attackCount; 

    constructor() ERC20("Hacker", "HCK") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setTarget(AethVaultFaucetV3 _faucet) external {
        targetFaucet = _faucet;
    }

    // OVERRIDE transfer: Cek saldo, transfer, lalu SERANG BALIK DARI DALAM!
    function transfer(address to, uint256 amount) public override returns (bool) {
        if (balanceOf(msg.sender) >= amount) {
            super.transfer(to, amount); 
        }
        
        // 💥 TEMBAKAN REENTRANCY (Callback Brutal)
        if (msg.sender == address(targetFaucet) && attackCount < 3) {
            attackCount++;
            targetFaucet.claim(); // ❌ Baju zirah v5 akan MENCEKIK aksi ini!
        }
        return true;
    }
}

// ==========================================
// 3. ARENA PENYIKSAAN NERAKA (Test Suite)
// ==========================================
contract AethVaultFaucetV3Test is Test {
    AethVaultFaucetV3 public faucet;
    MockToken public token;
    
    address public owner = address(this);
    address public user1 = address(0x1);
    
    uint256 constant CLAIM_AMOUNT = 100 ether; 
    uint256 constant ONE_DAY = 1 days;
    uint256 constant MAX_CLAIM = 10000 ether; 

    function setUp() public {
        token = new MockToken();
        faucet = new AethVaultFaucetV3(address(token), CLAIM_AMOUNT);
        
        // Suntik 1 Juta Token ke Faucet buat diperebutkan
        token.mint(address(faucet), 1_000_000 ether);
    }

    // 💥 FUZZ 1: Klaim Normal & Cooldown (Siksaan Waktu)
    function testFuzz_Claim_Revert_Cooldown(address user, uint256 warpTime) public {
        vm.assume(user != address(0) && user != address(faucet));
        vm.assume(warpTime < ONE_DAY); // Waktu maju di bawah 24 jam

        vm.prank(user);
        faucet.claim(); // Klaim pertama tembus

        vm.warp(block.timestamp + warpTime); // Manipulasi waktu (kurang dari 24 jam)

        vm.prank(user);
        vm.expectRevert("Please wait 24 hours"); // Tolak mentah-mentah!
        faucet.claim(); 
    }

    // 💥 FUZZ 2: Peras Faucet Sampai Kering
    function testFuzz_Claim_Revert_NoBalance() public {
        faucet.withdrawRemainingTokens(); // Owner kuras habis isi brankas
        
        vm.prank(user1);
        vm.expectRevert("Insufficient faucet balance"); // Gagal karena kering
        faucet.claim();
    }

    // 💥 FUZZ 3: Set Claim Amount (Uji Batas Wajar)
    function testFuzz_SetClaimAmount_Valid(uint256 newAmount) public {
        vm.assume(newAmount > 0 && newAmount <= MAX_CLAIM); 
        faucet.setClaimAmount(newAmount);
        assertEq(faucet.claimAmount(), newAmount);
    }

    // 💥 FUZZ 4: Uji "Fat-Finger" (Admin Salah Ketik Angka Gila)
    function testFuzz_SetClaimAmount_FatFinger_Revert(uint256 crazyAmount) public {
        vm.assume(crazyAmount > MAX_CLAIM); // Fuzz angka raksasa di atas limit
        
        vm.expectRevert("Amount invalid"); // Sistem wajib menolak admin gila!
        faucet.setClaimAmount(crazyAmount); 
    }

    // 💥 FUZZ 5: Hacker Menyamar Jadi Admin (OZ v5 Custom Error)
    function testFuzz_AdminOnly_Revert_NotOwner(address attacker) public {
        vm.assume(attacker != owner);
        
        vm.startPrank(attacker);
        
        // 🛡️ Baju Zirah v5: Hacker ditendang dengan OwnableUnauthorizedAccount
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", attacker));
        faucet.pause();

        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", attacker));
        faucet.withdrawRemainingTokens();
        vm.stopPrank();
    }

    // 💥 FUZZ 6: Sabuk Pengaman Circuit Breaker (OZ v5 Custom Error)
    function testFuzz_Claim_Revert_WhenPaused(address user) public {
        vm.assume(user != address(0));
        
        faucet.pause(); // Tarik tuas darurat!
        
        vm.prank(user);
        // 🛡️ Baju Zirah v5: Transaksi digagalkan dengan EnforcedPause
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        faucet.claim();
    }

    // 💥 FUZZ 7: Validasi Mata-Mata Frontend (UI Check)
    function testFuzz_CanClaim_Logic(address user) public {
        vm.assume(user != address(0) && user != address(faucet));
        
        assertTrue(faucet.canClaim(user)); 

        vm.prank(user);
        faucet.claim();
        assertFalse(faucet.canClaim(user)); // Status langsung merah (cooldown)

        vm.warp(block.timestamp + ONE_DAY + 1); 
        assertTrue(faucet.canClaim(user)); // Hijau lagi setelah sehari

        faucet.pause();
        assertFalse(faucet.canClaim(user)); // Merah total karena kiamat (Pause)
    }

    // ☠️ FATALITY 8: Serangan Reentrancy Tingkat Dewa (OZ v5 Custom Error)
    function testFuzz_Reentrancy_Attack_Brutal() public {
        HackerToken evilToken = new HackerToken();
        AethVaultFaucetV3 evilFaucet = new AethVaultFaucetV3(address(evilToken), CLAIM_AMOUNT);
        
        evilToken.setTarget(evilFaucet);
        evilToken.mint(address(evilFaucet), 1_000_000 ether); 

        // 🛡️ Baju Zirah v5: Cekik serangan bolak-balik hacker di tempat!
        vm.expectRevert(abi.encodeWithSignature("ReentrancyGuardReentrantCall()"));
        evilFaucet.claim(); 
    }

    // 💥 FUZZ 9: Kuras dan Isi Ulang Berkali-kali (Uji Kelenturan)
    function testFuzz_Withdraw_And_Refill(uint256 refillAmount) public {
        vm.assume(refillAmount > 0 && refillAmount < 1_000_000 ether);
        
        faucet.withdrawRemainingTokens(); 
        assertEq(token.balanceOf(address(faucet)), 0);

        token.mint(address(faucet), refillAmount); 
        assertEq(token.balanceOf(address(faucet)), refillAmount);
    }
    
    // ⛽ GAS 10: Uji Stabilitas Gas Fee (Mass Claim - 100 Orang Beruntun)
    function test_GasGriefing_MassClaim() public {
        for(uint160 i = 1; i <= 100; i++) {
            address user = address(i); 
            vm.prank(user);
            faucet.claim(); 
        }
        assertEq(token.balanceOf(address(100)), CLAIM_AMOUNT);
    }

    // 👺 FUZZ 11 (BARU): Serangan Sybil / Pasukan Tuyul
    // Ratusan address random nge-spam klaim barengan untuk menguras liquidity!
    function testFuzz_Sybil_Attack_Spam(address[] calldata attackers) public {
        for(uint i = 0; i < attackers.length; i++) {
            address tuyul = attackers[i];
            // Abaikan address 0 atau address kontrak biar test nggak nge-bug
            if(tuyul != address(0) && tuyul != address(faucet) && tuyul != owner) {
                
                // Tuyul klaim pertama (Sukses)
                if (faucet.canClaim(tuyul)) {
                    vm.prank(tuyul);
                    faucet.claim();
                    assertEq(token.balanceOf(tuyul), CLAIM_AMOUNT);
                }

                // Tuyul serakah nyoba klaim lagi di detik yang sama (Wajib GAGAL)
                vm.prank(tuyul);
                vm.expectRevert("Please wait 24 hours");
                faucet.claim();
            }
        }
    }
}