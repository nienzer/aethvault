# 📝 GRANT PROPOSAL — AetherVault (AETH)
## BNB Chain Builder Grant — Micro-Grant / Hackathon Track

---

## 1. PROJECT OVERVIEW

| Field | Details |
|-------|-----|
| **Project Name** | AetherVault |
| **Token Symbol** | AETH |
| **Category** | DeFi + NFT + SocialFi |
| **Tagline** | Digital Legacy, Proof of Existence & Sustainable Staking on BNB Chain |
| **One-Liner** | A secure platform to store encrypted future messages, mint digital proof of copyright ownership, and execute sustainable staking models. |

---

## 2. PROBLEM STATEMENT

1. **Loss of Digital Legacy** — Currently, when a user passes away, their crypto assets, private keys, passwords, and critical messages are often lost forever due to the lack of a decentralized inheritance protocol.

2. **Unverifiable Digital Ownership** — Independent creators lack an unalterable, cryptographically stamped proof to verify that their intellectual work existed at a specific point in time without relying on centralized copyright authorities.

3. **Unsustainable Staking Models** — The vast majority of Web3 staking protocols rely heavily on continuous token inflation (minting new tokens). This dilutes token value and causes long-term economic collapse.

---

## 3. THE SOLUTION — AETHERVAULT ECOSYSTEM

| Product | Description | Core Smart Contract |
|--------|-----------|---------|
| **Time-Lock Capsule** | Securely seals encrypted files or messages that can only be unlocked at a designated future date. | AetherVaultV3 |
| **Digital Legacy** | Programmatically transfers asset access to a designated beneficiary after 5+ years of wallet inactivity. | AetherVaultV3 |
| **Proof NFT** | Mints an immutable ERC-721 certificate proving timestamped ownership of digital intellectual property. | AetherVaultV3 |
| **Anti-Whale Staking** | Distributes real platform revenue yields instead of inflationary minting, capped at 50,000 $AETH per wallet. | AetherVaultStakingSecureV6 |
| **Team Vesting** | Locks the founder/dev allocation with a 24-month linear release to build long-term community trust. | TeamVesting |

### Core Architectural Innovations

- **On-Chain Hashing, Off-Chain Content** — Only the 32-byte cryptographic file hash is stored directly on the BSC blockchain, while the encrypted content remains secured on decentralized storage layers. This guarantees absolute data integrity with ultra-low gas consumption.
- **Layered Privacy Controls** — Integrated private proof systems hide sensitive metadata from non-owners via custom tokenURI override protocols.
- **Auto-Funding Staking Protocol** — Eliminates token inflation. Staking rewards are directly funded by platform utilities, where a significant portion of all contract interaction fees flow straight into the staking reward pool.
- **Anti-Hostage Emergency Pause** — Ensures total user asset safety by allowing instant emergency withdrawals even if the core contract is set to a paused state.

---

## 4. TECHNICAL ARCHITECTURE

### Smart Contracts (4 Core Modular Contracts — 25/25 Tests Passing)

All 4 core smart contracts have been thoroughly compiled under Solidity `0.8.20` / `0.8.24` and have successfully passed a rigorous 25-scenario automated Hardhat suite testing matrix with a 100% success rate on the local EVM target.

| Contract Name | Code Line Count | Test Suite Status | Current Network Status |
|---------|-------|------|--------|
| AetherVault (Token) | ~120 Lines | 6 Scenarios Passed (✓) | ✅ Deployed & Verified on BSC Testnet |
| AetherVaultV3 | ~350 Lines | 6 Scenarios Passed (✓) | ✅ Local Suite Verified / Ready |
| AetherVaultStakingSecureV6 | ~300 Lines | 7 Scenarios Passed (✓) | ✅ Local Suite Verified / Ready |
| TeamVesting | ~120 Lines | 7 Scenarios Passed (✓) | ✅ Local Suite Verified / Ready |

### Hardened Security Features
- ✅ **Ownable2Step:** Anti-hijack contract ownership transfer protocol.
- ✅ **ReentrancyGuard:** Hardened protection against nested execution attacks.
- ✅ **Pausable with Anti-Hostage Logic:** Emergency protection that never locks user capital.
- ✅ **Timelock Governance:** Enforces a mandatory 48-hour delay on all configuration updates.
- ✅ **Mathematical Caps:** Hard-coded 20% Maximum APY limits and a strict 50,000 AETH max stake limit per wallet to eliminate whale manipulation.
- ✅ **Custom Errors:** Highly optimized Solidity custom error handling to minimize gas consumption.

### Technical Stack
- **Blockchain Network:** BNB Chain (BSC)
- **Smart Contract Language:** Solidity ^0.8.20 / ^0.8.24
- **Framework & Libraries:** Hardhat v2.22.1 + OpenZeppelin v5 + Ethers v6 + Chai
- **Frontend Architecture:** React.js + Next.js with Web3 Wallet Providers

---

## 5. TOKENOMICS & PROTOCOL FEES

### AETH Token Allocation (100,000,000 Total Fixed Supply)

| Allocation | Percentage | Token Amount | Vesting Schedule |
|---------|---|--------|---------|
| Liquidity Pool | 30% | 30,000,000 AETH | None (Instant Market Depth) |
| Staking Rewards | 25% | 25,000,000 AETH | None (Distributed Over Time) |
| Initial Public Sale | 20% | 20,000,000 AETH | None |
| **Team / Founder** | **15%** | **15,000,000 AETH** | **6-Month Cliff + 24-Month Linear Monthly Release** |
| Treasury / Reserve | 10% | 10,000,000 AETH | None |

### Sustainable Fee Distribution Pipeline

Every time a user interacts with the platform (e.g., minting a copyright certificate), a flat service fee of 200 AETH is applied. The protocol processes this fee automatically through the core smart contract logic using the breakdown below:

| Revenue Stream Component | Percentage Allocation | Token Amount (per 200 AETH Fee) | Final On-Chain Destination Target |
|--------------------------|-----------------------|---------------------------------|-----------------------------------|
| **Deflationary Burn**     | 20% Allocation        | 40 AETH Burned                  | Sent directly to the Dead Address |
| **Platform Staking Pool** | 40% Allocation        | 80 AETH Distributed             | Real-Yield Rewards for Stakers    |
| **Project Treasury**      | 40% Allocation        | 80 AETH Distributed             | Operations & Node Hosting Costs   |

### Strategic Staking Tier Matrix

To incentivize long-term asset retention while maintaining absolute market decentralization, a strict maximum deposit limit of **50,000 AETH per wallet** is hard-coded across all staking channels.

| Tier Name | APY | Locking Duration | Minimum Requirement | Maximum Cap Limit |
|------|-----|------|-----------|-----------|
| Flexible | 4% | None (Instant Claim) | 1 AETH | 50,000 AETH |
| Bronze | 8% | 30 Days | 100 AETH | 50,000 AETH |
| Silver | 14% | 180 Days | 1,000 AETH | 50,000 AETH |
| Gold | 20% | 365 Days | 5,000 AETH | 50,000 AETH |

---

## 6. TEAM SUMMARY

| Role | Alias / Handle | Background & Commitment | Allocation Status |
|------|-----------|------------|----------|
| **Founder & Lead Developer** | Nienzer | Solo Web3 Developer / Full-Time Commitment | 15% Supply Locked in TeamVesting |

*Note: As a dedicated solo developer, my complete token allocation is fully locked on-chain via the TeamVesting contract. This guarantees absolute skin in the game and protects investor liquidity.*

---

## 7. STRATEGIC ROADMAP

### Phase 1: Foundation (Month 1) ✅
- [x] Complete architecture design and modular contract development.
- [x] Implement comprehensive unit testing (25/25 Hardhat test cases passing).
- [x] Successful deployment of token smart contract on the BSC Testnet environment.
- [ ] Run internal security code optimizations using automated scanning tools (Slither).

### Phase 2: User Interface & Integration (Month 2–3)
- [ ] Complete full React.js frontend development.
- [ ] Integrate Web3 wallets and connect interface actions to the BSC Testnet contract layer.
- [ ] Launch open public beta testing for the "Hall of Proof™" certificate registry gallery.

### Phase 3: Mainnet Launch & Liquidity (Month 4–5)
- [ ] Official deployment of all 4 contracts on the BSC Mainnet.
- [ ] Live execution of the linear TeamVesting protocol and Anti-Whale Staking layer.
- [ ] Establish initial liquidity pools and listing on PancakeSwap DEX.

### Phase 4: Scaling & Expansion (Month 6+)
- [ ] Evaluate integrations with BNB Greenfield for decentralized legacy storage.
- [ ] Expand the ecosystem onto opBNB layer-2 for high-frequency transactions.

---

## 8. FUNDING REQUEST & MILESTONES

| Operational Item | Requested Budget | Purpose & Resource Allocation |
|------|--------|--------|
| **Total Requested Funding** | **$10,000** | **Taktis Solo Developer Execution Fund** |
| Frontend Integration | $4,000 | React.js frontend development and Web3 provider pipeline connection. |
| Security Optimization | $2,000 | Automated security auditing tools (Slither) and optimization. |
| Community & Marketing | $2,500 | Launch campaigns and community development within the BNB Chain ecosystem. |
| Infrastructure Deployment | $1,500 | Mainnet contract deployment fees and initial decentralized storage node hosting. |

### Payout Milestone Checkpoints

| Milestone # | Tangible Deliverable | Estimated Timeline | Payout Percentage |
|---|-------------|----------|---------|
| **Milestone 1** | Live public GitHub repository showcasing all 4 smart contracts with 25/25 automated Hardhat testing report confirmation. | Week 2 | 30% ($3,000) |
| **Milestone 2** | Integrated web frontend app completely connected to the BSC Testnet layer, ready for public beta simulation. | Month 1 | 30% ($3,000) |
| **Milestone 3** | Live deployment on the BSC Mainnet with verified token utilities, functional staking, and active burn counter mechanisms. | Month 2 | 40% ($4,000) |

---

## 9. RESOURCES & PROJECT VERIFICATION LINKS

| Resource Target | URL / Repository Location |
|-----------------|---------------------------|
| **GitHub Repository** | [TO BE INSERTED: GitHub Link] |
| **AETH Token Testnet Address** | [TO BE INSERTED: 0x...] |
| **AetherVaultV3 Testnet Address** | [TO BE INSERTED: 0x...] |
| **Staking Contract Testnet Address** | [TO BE INSERTED: 0x...] |
| **Vesting Contract Testnet Address** | [TO BE INSERTED: 0x...] |
| **Application Video Demo** | [TO BE INSERTED: Drive / YouTube Link] |

---

## 10. WHY AETHERVAULT DESERVES THE BUILDER GRANT

1. **Solves a Massive Real-World Issue:** Digital inheritance and immutable data preservation represent an expanding multi-billion dollar market that blockchain technology can natively solve.
2. **True Economic Sustainability:** The protocol rejects hyper-inflationary models. Staking rewards are directly fueled by real platform revenue, protecting early backers.
3. **Optimized for BNB Chain Ecosystem:** Low transactional costs on BSC enable high-frequency certificate minting and low-entry barrier flexible staking for retail users.
4. **Security as a Foundational Priority:** Proved via 25 strict automated tests, double-layered ownership transfer protocols, and robust automated parameters.
5. **Absolute Developer Integrity:** The 24-month linear vesting contract proves a permanent commitment to the ecosystem's longevity.

---

*"Building the decentralized infrastructure for eternal digital preservation on the BNB Chain."*

**Submitted By:** Nienzer  
**Submission Date:** 11 August 2026  
**Contact Email:** dananienzin@gmail.com 
**Telegram Handle:** nienzer
