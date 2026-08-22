# 🛡️ AetherVault Core: Smart Contract Ecosystem

A robust, audited, and decentralized ecosystem designed for the Future Message Capsule and On-Chain Copyright Registry. This codebase utilizes a modern hybrid toolchain (Hardhat + Foundry) for rigorous automated testing, security verification, and gas optimization.

## 📑 Official Grant Proposal
For the complete business overview, protocol value proposition, and ecosystem catalyst details, please read our official proposal document here:
👉 **[Read the AetherVault Builder Grant Proposal](./grant-docs/GRANT_PROPOSAL.md)**

---

## 🚀 Performance Metrics
*   **Total Test Cases:** 30 Scenarios + 128,000+ Invariant Runs
*   **Passed:** 100% Success Rate
*   **Frameworks:** Hardhat (Mocha & Chai) & Foundry (Forge)
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

---

## 🛡️ Security, Static Analysis & Hybrid Toolchain

We prioritize transparency and industrial-grade security by employing a **Hybrid Development Toolchain** to ensure zero-compromise contract integrity.

### 1. Hardhat & Slither (Static Analysis)
Our initial architecture and deployment scripts were constructed using Hardhat, allowing us to seamlessly integrate **Slither** for rigorous vulnerability scanning.
*   **Reentrancy Protection:** All external-facing functions are protected by OpenZeppelin's `nonReentrant` modifier.
*   **Intentional Balance Logic:** `reentrancy-balance` warnings in our Staking contract are **False Positives**. They stem from our deliberate use of balance verification to handle fee-on-transfer tokens securely.
*   **Dependency Audit:** Warnings found in `node_modules` belong to OpenZeppelin's standard audited libraries.

### 2. Foundry (High-Performance Compilation & Gas Profiling)
For the Mainnet-ready compilation and advanced gas optimization, the core pipeline utilizes **Foundry** (`forge build` and `forge test`). We have successfully executed a 30-test suite with complete gas profiling to ensure maximum cost-efficiency on the BNB Chain.

👉 **[View the Complete Foundry Gas Report here](./grant-docs/GAS_REPORT.txt)**

### 3. Advanced Audit-Ready Testing (Fuzzing & Invariants)
To guarantee the highest degree of protocol safety, we extended our Foundry test suite beyond standard stateless testing. We have integrated advanced testing methodologies targeting our core ecosystem:
*   **Fuzz Testing:** Using property-based testing to spam critical functions across the AetherVault Token, Soulbound veAETH, and Team Vesting contracts with thousands of randomized inputs, ensuring no hidden overflows or logic bypasses exist.
*   **Invariant Testing:** Hardcoding absolute mathematical truths (e.g., *the Staking contract's token balance must strictly be greater than or equal to the `totalStaked` across all users at any given state*) to prove the system's solvency against 128,000+ random transaction sequences targeting our Staking V6 and Vault V3 contracts.

👉 **[View the Complete Fuzz & Invariant Audit Report here](./grant-docs/AUDIT_REPORT.txt)**

> **⚠️ Developer Note: Regarding Foundry Linter Warnings**
> During the compilation process, the Foundry linter may display several cosmetic warnings (e.g., `custom-errors`, `mixed-case-variable`, `block-timestamp`). Please note that these stylistic choices were made intentionally for this Mainnet-ready MVP:
> 1. We retained string-based `require` statements instead of `custom-errors` to maintain absolute compatibility with our existing React frontend error-extraction logic.
> 2. We bypassed some immutable casing rules to preserve the stability of the current ABI bindings.
> 3. Usage of `block.timestamp` is constrained within standard lock periods where validator manipulation has zero material impact on security.
> *These stylistic warnings will be refactored strictly post-grant during the V2 frontend integration.*

---

## 📂 Evidence of Verification
We are committed to full transparency regarding our development process:
*   **Foundry Execution & Gas Log:** [GAS_REPORT.txt](./grant-docs/GAS_REPORT.txt)
*   **Foundry Fuzz & Invariant Audit Log:** [AUDIT_REPORT.txt](./grant-docs/AUDIT_REPORT.txt)
*   **Test Execution Logs:** [See Automated Test Results](./screenshots/)
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

# Run Slither static analysis security audit
slither . --exclude-dependencies