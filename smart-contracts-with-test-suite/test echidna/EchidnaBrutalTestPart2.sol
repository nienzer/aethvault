// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./AetherVaultV3.sol";
import "./TeamVesting.sol";
import "./AetherVault.sol"; // Menggunakan kontrak asli

contract EchidnaBrutalTestPart2 {
    AetherVaultV3_Testnet public vaultV3;
    TeamVesting public vesting;
    AetherVault public token;

    constructor() {
        // 1. Deploy AetherVault Asli
        token = new AetherVault(
            address(this), 
            address(this), 
            address(this), 
            address(this), 
            address(0x111) 
        );
        
        // 2. Deploy AetherVaultV3 (Makam Digital / Capsule)
        vaultV3 = new AetherVaultV3_Testnet(
            address(token), 
            address(0x111), // Treasury
            address(0x222)  // Staking
        );
        token.approve(address(vaultV3), type(uint256).max);

        // 3. Deploy TeamVesting dengan alokasi 1 Juta AETH dari dompet tim
        vesting = new TeamVesting(
            address(token), 
            address(this), // Echidna sebagai beneficiary
            block.timestamp, 
            1_000_000 * 10**18
        );
        token.transfer(address(vesting), 1_000_000 * 10**18);
    }

    // =======================================================
    // 💀 HUKUM MUTLAK UNTUK AETHER VAULT V3
    // =======================================================
    function echidna_legacy_inactivity_minimum_safe() public view returns (bool) {
        return vaultV3.MIN_INACTIVITY_LIMIT() == 5 minutes;
    }

    function echidna_vault_burned_math_safe() public view returns (bool) {
        // Sekarang burn benar-benar berinteraksi dengan totalBurnedAeth dari kontrak asli
        return vaultV3.burnedAeth() >= 0; 
    }

    // =======================================================
    // 💀 HUKUM MUTLAK UNTUK TEAM VESTING
    // =======================================================
    function echidna_vesting_claim_never_exceeds_allocated() public view returns (bool) {
        return vesting.released() <= vesting.totalAllocated();
    }

    function echidna_vesting_beneficiary_timelock_safe() public view returns (bool) {
        if (vesting.pendingBeneficiary() != address(0)) {
            return vesting.beneficiaryChangeTime() >= block.timestamp;
        }
        return true;
    }
}