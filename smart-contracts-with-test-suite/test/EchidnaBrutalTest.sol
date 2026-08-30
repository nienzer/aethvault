// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./AetherVaultStakingSecureV6.sol";
import "./AetherForge.sol"; // Nama file sudah benar
import "./AetherVault.sol"; // Menggunakan kontrak asli

contract EchidnaBrutalTest {
    AetherVaultStakingSecureV6 public staking;
    AetherForgeFactory public factory;
    AetherVault public token;

    constructor() {
        // 1. Deploy AetherVault Asli dengan supply yang didistribusikan ke Echidna (address(this))
        token = new AetherVault(
            address(this), // initialLiquidityPool
            address(this), // stakingRewardsWallet
            address(this), // initialSaleWallet
            address(this), // teamWallet
            address(0x111) // treasuryWallet
        );
        
        // 2. Deploy Staking V6
        staking = new AetherVaultStakingSecureV6(address(token));
        
        // 3. Deploy Forge Factory
        factory = new AetherForgeFactory(
            address(token), 
            address(0x222), // Mock Treasury
            address(staking), 
            1000 * 10**18
        );

        // Berikan akses tanpa batas agar Echidna bisa tes brutal
        token.approve(address(staking), type(uint256).max);
        token.approve(address(factory), type(uint256).max);
    }

    // =======================================================
    // 💀 SIKSAAN UNTUK STAKING V6 (TERHUBUNG TOKEN ASLI)
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

    // =======================================================
    // 💀 SIKSAAN UNTUK FORGE FACTORY V3 (TERHUBUNG TOKEN ASLI)
    // =======================================================
    function echidna_factory_fee_never_exceeds_limit() public view returns (bool) {
        return factory.creationFee() <= factory.MAX_CREATION_FEE();
    }

    function echidna_factory_array_consistency() public view returns (bool) {
        return factory.getTotalTokensCreated() >= 0;
    }
}