# 🛡️ AetherVault Core: Smart Contract Audit-Ready Suite

This repository contains the core smart contracts for the **AetherVault Ecosystem (Future Message Capsule & On-Chain Copyright Registry)**[cite: 4]. All core contracts have been rigorously verified using the **Hardhat Automated Testing Suite** to guarantee absolute mathematical correctness, gas optimization, and robust anti-whale enforcement[cite: 4].

## 🔒 Security Standards & Overview
This codebase is engineered with a "Security-First" philosophy. Our contracts have undergone rigorous unit testing to ensure:
- **Mathematical Correctness:** 100% test coverage for all arithmetic operations[cite: 4].
- **Gas Efficiency:** Optimized operational costs on BNB Chain.
- **Audit-Readiness:** Modular architecture designed for seamless third-party auditing.

- **Total Test Cases:** 25 Scenarios[cite: 4]
- **Passed:** 25 / 25 (100% Success Rate)[cite: 4]
- **Framework:** Hardhat Engine with Mocha & Chai[cite: 4]
- **EVM Target:** Paris (Solidity 0.8.20 & 0.8.24 Multi-Compiler Setup)[cite: 4]

---

## 📊 Smart Contract Architecture & Test Suite Matrix

### 1. AetherVault.sol
Deflationary BEP-20 token managing total supply allocations and transactional burn logs[cite: 4].
- **Test File:** `01_Token.test.js` (`5 Scenarios Passed ✓`)[cite: 4]
- `✓` Deploy: Fixed total supply locked at 100,000,000 $AETH[cite: 4].
- `✓` Distribution: Verified allocation breakdown (LP 30%, Staking 25%, Sale 20%, Team 15%, Treasury 10%)[cite: 4].
- `✓` Burn tracking: On-chain event confirmation for `burn()` execution[cite: 4].
- `✓` Security checks: Anti-rescue implementation prevents unauthorized token retrieval[cite: 4].

### 2. AetherVaultV3.sol
On-chain metadata factory generating immutable proof certificates and future capsule seals without cloud dependency[cite: 4].
- **Test File:** `02_V3.test.js` (`6 Scenarios Passed ✓`)[cite: 4]
- `✓` Digital Fingerprinting: SHA-256 local hash extraction and validation[cite: 4].
- `✓` Sybil & Plagiarism Protection: Zero-tolerance logic instantly reverts duplicate file hashes[cite: 4].
- `✓` Time Capsule Seal: Relies on block timestamp verification to enforce minimum 5-year lock periods[cite: 4].

### 3. AetherVaultStaking.sol
Mathematical barrier limiting large capital control while maintaining multi-tiered yields[cite: 4].
- **Test File:** `03_Staking.test.js` (`7 Scenarios Passed ✓`)[cite: 4]
- `✓` Flexible execution: Tier 0 functions with instant withdrawal and zero-lock period[cite: 4].
- `✓` Anti-Whale Limit: Hard-coded maximum staking rules verified dynamically[cite: 4].
- `✓` Timelock Governance: 48-hour delay enforced for any parameter/tier configuration updates[cite: 4].

### 4. TeamVesting.sol
Linear vesting script ensuring team loyalty and preventing malicious liquidity rugs[cite: 4].
- **Test File:** `04_Vesting.test.js` (`7 Scenarios Passed ✓`)[cite: 4]
- `✓` Cliff Period: Absolute lock for the first 6 months (0 tokens claimable)[cite: 4].
- `✓` Linear Release: Programmatic unlocking structure (25% at month 6, 100% at month 24)[cite: 4].

---

## 📂 Evidence of Verification
We prioritize transparency. You can find visual proof of contract deployment, verified source code, and automated test execution here:
- [Automated Test Execution Logs (Screenshots)](screenshots/)
- [BSCScan Verified Contracts](bscscan/)
- [Video Walkthrough (YouTube)](https://www.youtube.com/watch?v=YOUR_YOUTUBE_LINK_HERE) 👈 *(Ganti dengan link video demo YouTube Bos)*

---

## 🚀 How to Verify Locally

To reproduce these successful test results on your local terminal environment, execute the following commands[cite: 4]:

```bash
npm install --legacy-peer-deps
npx hardhat test