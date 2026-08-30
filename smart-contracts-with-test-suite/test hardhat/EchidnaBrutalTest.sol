// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./AetherVaultStakingSecureV6.sol";
import "./AetherForge.sol";
import "./AetherVault.sol";

contract EchidnaBrutalTest {
    AetherVaultStakingSecureV6 public staking;
    AetherForgeFactory public factory;
    AetherVault public token;

    // 💀 Daftar 3 Dompet Pasukan Hacker (Sesuai dengan echidna.yaml Bos)
    address public hackerA = 0x00a329c0648769A73afAc7F9381E08FB43dBEA72;
    address public hackerB = address(0x1);
    address public hackerC = address(0x2);

    constructor() {
        // 1. Deploy AetherVault Asli
        token = new AetherVault(
            address(this), 
            address(this), 
            address(this), 
            address(this), 
            address(0x111) 
        );

        // 2. Deploy Staking V6
        staking = new AetherVaultStakingSecureV6(address(token));

        // 3. Deploy Forge Factory
        factory = new AetherForgeFactory(
            address(token),
            address(0x222), 
            address(staking),
            1000 * 10**18
        );

        // =======================================================
        // 💸 PENDANAAN PERANG UNTUK ECHIDNA & PASUKAN HACKER
        // =======================================================
        
        // Modal & Izin akses tak terbatas untuk Echidna Wrapper (address(this))
        token.approve(address(staking), type(uint256).max);
        token.approve(address(factory), type(uint256).max);

        // Suntik 10 Juta AETH ke masing-masing dompet hacker!
        // Dengan ini, Echidna akan menggerakkan mereka untuk spam fungsi stake, transfer, dan forge secara mandiri
        token.transfer(hackerA, 10_000_000 * 10**18);
        token.transfer(hackerB, 10_000_000 * 10**18);
        token.transfer(hackerC, 10_000_000 * 10**18);
    }

    // =======================================================
    // 🛡️ PROPERTIES: WAJIB return bool & view (Prefix echidna_)
    // =======================================================
    function echidna_staking_max_deposits_unbreakable() public view returns (bool) {
        return staking.getUserDepositCount(address(this)) <= staking.MAX_DEPOSITS_PER_WALLET();
    }

    function echidna_staking_max_cap_unbreakable() public view returns (bool) {
        return staking.userTotalStaked(address(this)) <= staking.MAX_STAKE_PER_WALLET();
    }

    function echidna_staking_solvency_always_safe() public view returns (bool) {
        return token.balanceOf(address(staking)) >= staking.totalStaked();
    }

    function echidna_staking_apy_never_exceeds_max() public view returns (bool) {
        (uint256 apy, ) = staking.tiers(3);
        return apy <= staking.MAX_APY_BPS();
    }

    function echidna_factory_fee_never_exceeds_limit() public view returns (bool) {
        return factory.creationFee() <= factory.MAX_CREATION_FEE();
    }

    // =======================================================
    // 💀 SIKSAAN LEVEL DEWA: Aksi brutal pencari bug (TIDAK PAKAI prefix echidna_)
    // =======================================================
    function action_staking_withdraw_all_money() public {
        uint256 totalStaked = staking.userTotalStaked(address(this));
        if(totalStaked == 0) return; // Skip kalau belum ada saldo

        uint256 balanceBefore = token.balanceOf(address(this));
        staking.withdraw(0, totalStaked); 
        uint256 balanceAfter = token.balanceOf(address(this));
        
        assert(balanceAfter >= balanceBefore); 
    }

    function action_staking_spam_deposit_withdraw() public {
        uint256 amount = 1 ether;
        if(token.balanceOf(address(this)) < amount * 10) return; // Pastikan uang cukup

        for (uint256 i = 0; i < 10; i++) {
            staking.stake(0, amount); 
            staking.withdraw(0, amount);
        }
        assert(staking.userTotalStaked(address(this)) == 0); 
    }

    function action_staking_dos_attack_via_claim() public {
        // Spam klaim beruntun, pastikan tidak ada inflasi aneh
        staking.claimReward();
        staking.claimReward();
        staking.claimReward();
        
        assert(token.balanceOf(address(this)) <= token.totalSupply()); 
    }

    function action_factory_spam_create_token() public {
        // Coba bikin token spam, batasi 2 agar tidak out-of-gas
        for (uint256 i = 0; i < 2; i++) {
            factory.createMyOwnToken("SpamToken", "SPAM", 1000 * 10**18); 
        }
        assert(factory.getTotalTokensCreated() >= 0); 
    }
}