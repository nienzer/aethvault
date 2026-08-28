No files changed, compilation skipped

Ran 35 tests for test/AetherVault.t.sol:AetherVaultEcosystemTest
[PASS] test_Forge_AdminUpdateFeeAndRecipients() (gas: 93686)
[PASS] test_Forge_CreateTokenSuccess() (gas: 826522)
[PASS] test_Forge_InitialConfig() (gas: 26932)
[PASS] test_Governor_TokenBindingIsCorrect() (gas: 7837)
[PASS] test_Governor_VotingDelayIsCorrect() (gas: 7797)
[PASS] test_RevertWhen_Forge_CreateTokenWithInvalidParams() (gas: 89014)
[PASS] test_RevertWhen_Forge_CreateTokenWithoutApprove() (gas: 46002)
[PASS] test_RevertWhen_Staking_WithoutApproval() (gas: 283350)
[PASS] test_RevertWhen_Staking_ZeroAmount() (gas: 91505)
[PASS] test_RevertWhen_Token_TransferExceedsBalance() (gas: 39607)
[PASS] test_RevertWhen_Vault_SealInThePast() (gas: 93725)
[PASS] test_RevertWhen_Vault_SealWithoutApproval() (gas: 59330)
[PASS] test_RevertWhen_Vesting_ClaimBeforeCliff() (gas: 41529)
[PASS] test_RevertWhen_Vesting_NotBeneficiary() (gas: 39232)
[PASS] test_RevertWhen_veAETH_TransferSoulbound() (gas: 240118)
[PASS] test_Staking_BindToAethToken() (gas: 7851)
[PASS] test_Staking_ContractHoldsTokens() (gas: 359814)
[PASS] test_Staking_StakeMultipleUsers() (gas: 655792)
[PASS] test_Staking_StakeTierZero() (gas: 356588)
[PASS] test_Staking_TotalStakedUpdatesCorrectly() (gas: 359481)
[PASS] test_Token_ApproveAndTransferFrom() (gas: 98701)
[PASS] test_Token_BalancesDistributedCorrectly() (gas: 19947)
[PASS] test_Token_InitialSupplyIsCorrect() (gas: 7812)
[PASS] test_Token_StandardTransfer() (gas: 55395)
[PASS] test_Vault_BindToAethToken() (gas: 9882)
[PASS] test_Vault_SealCapsuleBasic() (gas: 386967)
[PASS] test_Vault_SealCapsuleMultipleUsers() (gas: 693773)
[PASS] test_Vault_StakingTreasuryAddressBinding() (gas: 9938)
[PASS] test_Vesting_BeneficiaryIsTeam() (gas: 9895)
[PASS] test_Vesting_CliffCheckIsZeroInitially() (gas: 7791)
[PASS] test_Vesting_ContractHoldsAllocation() (gas: 10112)
[PASS] test_Vesting_TimeAdvanceIncrementsClaimable() (gas: 11384)
[PASS] test_Vesting_TotalAllocatedIsFixed() (gas: 5535)
[PASS] test_veAETH_BindToAethToken() (gas: 7871)
[PASS] test_veAETH_DepositAndMintSoulbound() (gas: 219680)
Suite result: ok. 35 passed; 0 failed; 0 skipped; finished in 594.18ms (89.00ms CPU time)

Ran 11 tests for test/AethVaultFaucetV3.t.sol:AethVaultFaucetV3Test
[PASS] testFuzz_AdminOnly_Revert_NotOwner(address) (runs: 256, μ: 60561, ~: 60561)
[PASS] testFuzz_CanClaim_Logic(address) (runs: 256, μ: 181844, ~: 181844)
[PASS] testFuzz_Claim_Revert_Cooldown(address,uint256) (runs: 256, μ: 125674, ~: 125674)
[PASS] testFuzz_Claim_Revert_NoBalance() (gas: 99876)
[PASS] testFuzz_Claim_Revert_WhenPaused(address) (runs: 256, μ: 66170, ~: 66170)
[PASS] testFuzz_Reentrancy_Attack_Brutal() (gas: 859150)
[PASS] testFuzz_SetClaimAmount_FatFinger_Revert(uint256) (runs: 256, μ: 32617, ~: 32617)
[PASS] testFuzz_SetClaimAmount_Valid(uint256) (runs: 256, μ: 40903, ~: 40888)
[PASS] testFuzz_Sybil_Attack_Spam(address[]) (runs: 256, μ: 16761732, ~: 16818145)
[PASS] testFuzz_Withdraw_And_Refill(uint256) (runs: 256, μ: 125432, ~: 125413)
[PASS] test_GasGriefing_MassClaim() (gas: 8505553)
Suite result: ok. 11 passed; 0 failed; 0 skipped; finished in 20.03s (20.03s CPU time)

Ran 1 test for test/AetherVaultAudit.t.sol:AetherVaultAuditTest
[PASS]
AetherVaultAuditTest invariants:
[PASS] invariant_AETH_Supply_Must_Never_Inflate
[PASS] invariant_ContractBalance_Healthy
[PASS] invariant_TotalBurned_Must_Match
[PASS] invariant_Treasury_Must_Match_Ghost
 AetherVaultAuditTest invariants (runs: 256, calls: 128000, reverts: 0)

╭--------------------------+-------------------------+-------+---------+----------╮
| Contract                 | Selector                | Calls | Reverts | Discards |
+=================================================================================+
| AetherVaultBrutalHandler | attack_DonateDust       | 31956 | 0       | 0        |
|--------------------------+-------------------------+-------+---------+----------|
| AetherVaultBrutalHandler | attack_SpamTokenMinting | 32248 | 0       | 0        |
|--------------------------+-------------------------+-------+---------+----------|
| AetherVaultBrutalHandler | chaos_TimeWarp          | 31885 | 0       | 0        |
|--------------------------+-------------------------+-------+---------+----------|
| AetherVaultBrutalHandler | user_StakeTokens        | 31911 | 0       | 0        |
╰--------------------------+-------------------------+-------+---------+----------╯

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 174.48s (174.47s CPU time)

╭------------------------------------------------+-----------------+------+--------+------+---------╮
| src/AetherGovernor.sol:AetherGovernor Contract |                 |      |        |      |         |
+===================================================================================================+
| Deployment Cost                                | Deployment Size |      |        |      |         |
|------------------------------------------------+-----------------+------+--------+------+---------|
|                                              0 |           17504 |      |        |      |         |
|------------------------------------------------+-----------------+------+--------+------+---------|
|                                                |                 |      |        |      |         |
|------------------------------------------------+-----------------+------+--------+------+---------|
| Function Name                                  | Min             | Avg  | Median | Max  | # Calls |
|------------------------------------------------+-----------------+------+--------+------+---------|
| token                                          |             366 |  366 |    366 |  366 |       1 |
|------------------------------------------------+-----------------+------+--------+------+---------|
| votingDelay                                    |            2490 | 2490 |   2490 | 2490 |       1 |
╰------------------------------------------------+-----------------+------+--------+------+---------╯

╭------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/AetherVault.sol:AetherVault Contract |                 |       |        |       |         |
+===============================================================================================+
| Deployment Cost                          | Deployment Size |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
|                                        0 |            7090 |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
|                                          |                 |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                            | Min             | Avg   | Median | Max   | # Calls |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| allowance                                |            2760 |  2760 |   2760 |  2760 |       4 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| approve                                  |           46384 | 46397 |  46396 | 46432 |   35389 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| balanceOf                                |             642 |  2583 |   2642 |  2642 |  102874 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalBurnedAeth                          |            2406 |  2406 |   2406 |  2406 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalSupply                              |            2370 |  2370 |   2370 |  2370 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| transfer                                 |           26747 | 36815 |  36757 | 53857 |   32107 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| transferFrom                             |           38122 | 38122 |  38122 | 38122 |       1 |
╰------------------------------------------+-----------------+-------+--------+-------+---------╯

╭------------------------------------------------------------------------+-----------------+--------+--------+--------+---------╮
| src/AetherVaultStakingSecureV6.sol:AetherVaultStakingSecureV6 Contract |                 |        |        |        |         |
+===============================================================================================================================+
| Deployment Cost                                                        | Deployment Size |        |        |        |         |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
|                                                                      0 |            9955 |        |        |        |         |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
|                                                                        |                 |        |        |        |         |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| Function Name                                                          | Min             | Avg    | Median | Max    | # Calls |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| MAX_STAKE_PER_WALLET                                                   |             261 |    261 |    261 |    261 |   32057 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| aethToken                                                              |             325 |    325 |    325 |    325 |       1 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| stake                                                                  |           28957 | 250183 | 252653 | 417040 |    3008 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| totalStaked                                                            |            2361 |   2361 |   2361 |   2361 |       2 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| userTotalStaked                                                        |            2584 |   2584 |   2584 |   2584 |   32057 |
╰------------------------------------------------------------------------+-----------------+--------+--------+--------+---------╯

╭------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/TeamVesting.sol:TeamVesting Contract |                 |       |        |       |         |
+===============================================================================================+
| Deployment Cost                          | Deployment Size |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
|                                        0 |            4983 |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
|                                          |                 |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                            | Min             | Avg   | Median | Max   | # Calls |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| beneficiary                              |            2359 |  2359 |   2359 |  2359 |       1 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| claim                                    |           28574 | 29727 |  29727 | 30880 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| claimableAmount                          |            2508 |  2556 |   2556 |  2604 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalAllocated                           |             250 |   250 |    250 |   250 |       1 |
╰------------------------------------------+-----------------+-------+--------+-------+---------╯


Ran 3 test suites in 181.47s (195.10s CPU time): 47 tests passed, 0 failed, 0 skipped (47 total tests)
