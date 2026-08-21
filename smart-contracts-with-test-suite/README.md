# 🛡️ AetherVault Core: Smart Contract Ecosystem

A robust, audited, and decentralized ecosystem designed for the Future Message Capsule and On-Chain Copyright Registry. This codebase utilizes Hardhat for rigorous automated testing and security verification.

## 🚀 Performance Metrics
- **Total Test Cases:** 30 Scenarios
- **Passed:** 30 / 30 (100% Success Rate)
- **Framework:** Hardhat (Mocha & Chai)
- **Solidity Version:** 0.8.20 & 0.8.24

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

## 🛡️ Security & Static Analysis (Slither Audit)

We prioritize transparency. Our contracts have undergone automated static analysis using **Slither**. While the audit identifies potential warnings, all findings have been vetted and addressed.

### Verified Design Patterns
*   **Reentrancy Protection:** All external-facing functions (Staking, Minting) are protected by OpenZeppelin's `nonReentrant` modifier.
*   **Intentional Balance Logic:** `reentrancy-balance` warnings in our Staking contract are **False Positives**. They stem from our deliberate use of balance verification to handle fee-on-transfer tokens securely.
*   **Dependency Audit:** Warnings found in `node_modules` (Governor, Math, EIP712) belong to OpenZeppelin's standard audited libraries. These reflect intentional architectural designs (like bitwise optimization in `Math.sol`) rather than security flaws.

---

## 📂 Evidence of Verification
We are committed to full transparency regarding our development process:
- **Test Execution Logs:** [See Automated Test Results](screenshots/)
- **BSCScan Verified:** [View Mainnet Contracts](bscscan/)
- **Live Demo:** [Watch Walkthrough Video](https://www.youtube.com/watch?v=YOUR_YOUTUBE_LINK_HERE)

---

## 🛠️ Local Reproduction

To reproduce our successful test environment, ensure you have Node.js installed, then execute:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the full test suite
npx hardhat test