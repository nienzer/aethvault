// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract AetherGovernor is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {
    
    constructor(IVotes _veAETHToken)
        Governor("AetherVault DAO Governor")
        GovernorSettings(
            3 minutes,         // TESTNET: Jeda 3 menit sebelum voting dimulai
            10 minutes,        // TESTNET: Durasi voting hanya 10 menit
            1000 * 10 ** 18    // ANTI-SPAM: Minimal punya 1.000 veAETH
        )
        GovernorVotes(_veAETHToken)
        GovernorVotesQuorumFraction(4) // KUORUM: 4%
    {}

    // --- FUNGSI OVERRIDE BAWAAN OPENZEPPELIN ---
    
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }
}