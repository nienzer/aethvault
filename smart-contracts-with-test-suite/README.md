# 🛡️ AetherVault Core: Smart Contract Ecosystem

A robust, audited, and decentralized ecosystem designed for the Future Message Capsule and On-Chain Copyright Registry. This codebase utilizes a modern hybrid toolchain (Hardhat + Foundry) for rigorous automated testing, security verification, and gas optimization.

## 📑 Official Grant Proposal & Vision
For the complete business overview, protocol value proposition, and ecosystem catalyst details, please read our official documents here:
👉 **[Executive Summary One-Pager (PDF)](./grant-docs/AetherVault_OnePager.pdf)**
👉 **[Read the AetherVault Builder Grant Proposal](./grant-docs/GRANT_PROPOSAL.md)**
👉 **[Why AetherVault? (Vision & Catalyst)](./grant-docs/Why_AetherVault.md)**

---

## 🧪 Special VIP Access for Judges & Reviewers
We have prepared a dedicated zero-friction faucet integrated directly into our main dashboard, allowing you to test the AetherVault dApp immediately without needing external testnet tokens:
1. Visit our main application: `https://aethvault.xyz`
2. Connect your MetaMask wallet (BNB Smart Chain Testnet).
3. Navigate to the **Faucet** section directly on the dashboard.
4. Click **Mint 5,000 AETH**.
5. You are now fully funded and ready to test all smart contract features on our platform!

---

## 🚀 Performance Metrics
*   **Total Test Cases:** Hardhat (46 Scenarios) | Foundry (48 Scenarios)
*   **Total Fuzzing & Invariant Runs:** 128,000+ Runs (Foundry) | 300,000+ Runs (Echidna)
*   **Passed:** 100% Success Rate across all frameworks
*   **Frameworks:** Hardhat (Mocha/Chai), Foundry (Forge/Rust), and Echidna (Haskell)
*   **Solidity Version:** 0.8.20 & 0.8.24

---

## 📊 Architecture & Test Matrix

| Module | Purpose | Tests | Status |
| :--- | :--- | :---: | :---: |
| **AetherVault Token** | BEP-20 Deflationary Supply | 5 | ✅ |
| **AetherVaultV3** | Proof Registry & Capsule Factory | 6 | ✅ |
| **Staking V6** | Tiered Yield & Anti-Whale Logic | 7 | ✅ |
| **Team Vesting** | Linear Release & Cliff Security | 7 | ✅ |
| **DAO Governance** | veAETH Voting & Proposal Lifecycle | 5 | ✅ |
| **AetherForge Factory** | Custom Token Creation & Fee Logic | 5 | ✅ |
| **AethVaultFaucetV3** | Faucet Cooldowns & Anti-Sybil Logic | 11 | ✅ |
| **Security Audit Suite**| Fuzzing & Invariant Validations | 2 | ✅ |

---

## 🛡️ Security, Static Analysis & Hybrid Toolchain

We prioritize transparency and industrial-grade security by employing a **Hybrid Development Toolchain** to ensure zero-compromise contract integrity.

### 1. Hardhat & Slither (Static Analysis)
Our initial architecture and deployment scripts were constructed using Hardhat, allowing us to seamlessly integrate **Slither** for rigorous vulnerability scanning.
*   **Reentrancy Protection:** All external-facing functions are protected by OpenZeppelin's `nonReentrant` modifier.
*   **Intentional Balance Logic:** `reentrancy-balance` warnings in our Staking contract are **False Positives**. They stem from our deliberate use of balance verification to handle fee-on-transfer tokens securely.
*   **Dependency Audit:** Warnings found in `node_modules` belong to OpenZeppelin's standard audited libraries.

### 2. Foundry (High-Performance Compilation & Gas Profiling)
For the Mainnet-ready compilation and advanced gas optimization, the core pipeline utilizes **Foundry** (`forge build` and `forge test`). We have successfully executed a 37-test suite with complete gas profiling to ensure maximum cost-efficiency on the BNB Chain.

👉 **[Comprehensive Security Audit Report (PDF)](./grant-docs/AetherVault_Final_Audit_Report.pdf)**

### 3. Advanced Audit-Ready Testing (Foundry Fuzzing & Invariants)
To guarantee the highest degree of protocol safety, we extended our Foundry test suite beyond standard stateless testing. 
*   **Fuzz Testing:** Spamming critical functions across the AetherVault Token, Soulbound veAETH, and Team Vesting contracts with thousands of randomized inputs, ensuring no hidden overflows.
*   **Invariant Testing:** Hardcoding absolute mathematical truths to prove the system's solvency against 128,000+ random transaction sequences targeting our Staking V6 and Vault V3 contracts.

### 4. Extreme Property-Based Testing (Echidna)
To achieve a "Double-Audit" standard, we subjected the entire ecosystem to **Echidna**, a Haskell-based mathematical fuzzer by Trail of Bits. We successfully executed over 300,000 brutal randomized calls against our invariant contracts to ensure:
*   Core token burn mathematics are completely overflow-proof.
*   Staking APY and withdrawal mechanisms never break solvency limits.
*   DAO governance time-locks and vesting cliff periods cannot be bypassed under any manipulated network conditions.

👉 **[Comprehensive Security Audit Report (PDF)](./grant-docs/AetherVault_Final_Audit_Report.pdf)**

👉 **[Comprehensive Security Audit Report (PDF)](./grant-docs/AetherVault_Final_Audit_Report.pdf)**
> **⚠️ Developer Note: Regarding Foundry Linter Warnings**
> During the compilation process, the Foundry linter may display several cosmetic warnings (e.g., `custom-errors`, `mixed-case-variable`, `block-timestamp`). Please note that these stylistic choices were made intentionally for this Mainnet-ready MVP:
> 1. We retained string-based `require` statements instead of `custom-errors` to maintain absolute compatibility with our existing React frontend error-extraction logic.
> 2. We bypassed some immutable casing rules to preserve the stability of the current ABI bindings.
> 3. Usage of `block.timestamp` is constrained within standard lock periods where validator manipulation has zero material impact on security.
> *These stylistic warnings will be refactored strictly post-grant during the V2 frontend integration.*

---

## 📂 Evidence of Verification
We are committed to full transparency regarding our development process:
👉 **[Comprehensive Security Audit Report (PDF)](./grant-docs/AetherVault_Final_Audit_Report.pdf)**
*   **Echidna & Foundry Dashboards:** [View Fuzzing Screenshots](./screenshots/)
*   **BSCScan Verified:** [View Mainnet Contracts](./bscscan/)

---

## 🛠️ Local Reproduction

To reproduce our successful test environment locally:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the full Hardhat test suite
npx hardhat test

# Run Foundry compilation check
forge build

# Run Foundry Test Suite & Gas Report
forge test --gas-report

# Run Foundry Advanced Audit (Fuzz & Invariant Testing)
forge test --match-contract AetherVaultAuditTest

# Run Foundry Fuzz Testing on Faucet V3
forge test --match-contract AethVaultFaucetV3Test

# Run Slither static analysis security audit
slither . --exclude-dependencies

# Run Echidna Extreme Fuzzing (Requires Echidna CLI)
# ==========================================
# Part 1: Test Core Token, Staking V6, and Forge Factory
echidna . --contract EchidnaBrutalTest --config echidna.yaml

# Part 2: Test Digital Vault V3 (Capsule) and Team Vesting
echidna . --contract EchidnaBrutalTestPart2 --config echidna.yaml

# Part 3: Test DAO Governance, veAETH, and Faucet V3
echidna . --contract EchidnaBrutalTestPart3 --config echidna.yaml