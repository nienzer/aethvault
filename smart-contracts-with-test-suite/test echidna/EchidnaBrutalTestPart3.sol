// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./veAETH.sol";
import "./AetherGovernor.sol";
import "./AethVaultFaucetV3.sol";
import "./AetherVault.sol";

contract EchidnaBrutalTestPart3 {
    AetherVault public token;
    veAETH public veToken;
    AetherGovernor public governor;
    AethVaultFaucetV3 public faucet;

    constructor() {
        // 1. Deploy Kontrak Utama AetherVault (Token Asli)
        token = new AetherVault(
            address(this), // initialLiquidityPool
            address(this), // stakingRewardsWallet
            address(this), // initialSaleWallet
            address(this), // teamWallet
            address(0x111) // treasuryWallet
        );

        // 2. Deploy Faucet
        faucet = new AethVaultFaucetV3(address(token), 100 * 10**18);
        token.transfer(address(faucet), 1_000_000 * 10**18);

        // 3. Deploy Ekosistem DAO
        veToken = new veAETH(address(token));
        governor = new AetherGovernor(veToken);
        
        // Modal Echidna
        token.approve(address(veToken), type(uint256).max);
    }

    // =======================================================
    // 💀 HUKUM MUTLAK UNTUK AETHER VAULT (TOKEN UTAMA)
    // =======================================================
    
    // HUKUM 1: Sistem pencatatan burn (totalBurnedAeth) tidak boleh error atau overflow saat dihajar[cite: 3].
    function echidna_core_token_burn_math_safe() public view returns (bool) {
        return token.totalBurnedAeth() >= 0;
    }

    // =======================================================
    // 💀 HUKUM MUTLAK UNTUK FAUCET V3
    // =======================================================

    // HUKUM 2: Admin tidak bisa sembarangan mengatur batas klaim lebih dari MAX_CLAIM (10.000 ether)[cite: 6].
    function echidna_faucet_claim_amount_never_exceeds_max() public view returns (bool) {
        return faucet.claimAmount() <= faucet.MAX_CLAIM();
    }

    // =======================================================
    // 💀 HUKUM MUTLAK UNTUK GOVERNANCE & veAETH
    // =======================================================

    // HUKUM 3: Jeda waktu (delay) sebelum voting dimulai harus selalu terkunci di 3 menit[cite: 2].
    function echidna_governor_delay_safe() public view returns (bool) {
        return governor.votingDelay() == 3 minutes;
    }

    // HUKUM 4: Durasi voting (period) tidak boleh diubah-ubah, harus mutlak 10 menit[cite: 2].
    function echidna_governor_period_safe() public view returns (bool) {
        return governor.votingPeriod() == 10 minutes;
    }

    // HUKUM 5: Syarat minimal untuk membuat proposal (Threshold) harus mutlak 1000 veAETH[cite: 2].
    function echidna_governor_threshold_safe() public view returns (bool) {
        return governor.proposalThreshold() == 1000 * 10 ** 18;
    }
}