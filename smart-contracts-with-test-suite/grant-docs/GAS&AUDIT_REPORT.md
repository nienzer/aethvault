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
Suite result: ok. 35 passed; 0 failed; 0 skipped; finished in 27.03ms (15.90ms CPU time)

Ran 2 tests for test/AetherVaultAudit.t.sol:AetherVaultAuditTest
[PASS]
AetherVaultAuditTest invariants:
[PASS] invariant_StakingContractMustAlwaysHoldEnoughTokens
[PASS] invariant_StakingMathIsPerfect
[PASS] invariant_VaultCapsuleCountIsAccurate
[PASS] invariant_VaultFeeDistributionIsFair
 AetherVaultAuditTest invariants (runs: 256, calls: 128000, reverts: 0)

╭--------------------+-------------------------------+-------+---------+----------╮
| Contract           | Selector                      | Calls | Reverts | Discards |
+=================================================================================+
| AetherVaultHandler | advanceTimeAndTryClaimVesting | 31955 | 0       | 0        |
|--------------------+-------------------------------+-------+---------+----------|
| AetherVaultHandler | forgeTokenRandom              | 32217 | 0       | 0        |
|--------------------+-------------------------------+-------+---------+----------|
| AetherVaultHandler | sealCapsuleRandomTime         | 31910 | 0       | 0        |
|--------------------+-------------------------------+-------+---------+----------|
| AetherVaultHandler | stakeRandom                   | 31918 | 0       | 0        |
╰--------------------+-------------------------------+-------+---------+----------╯

[PASS] testFuzz_veAETH_IsSoulboundAndCannotBeTransferred(uint256,address) (runs: 256, μ: 457275, ~: 457623)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 249.38s (249.91s CPU time)

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
| approve                                  |           26484 | 43716 |  46396 | 46432 |   83798 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| balanceOf                                |             642 |  2557 |   2642 |  2642 |  566656 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalBurnedAeth                          |            2406 |  2406 |   2406 |  2406 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalSupply                              |            2370 |  2370 |   2370 |  2370 |       1 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| transfer                                 |           26747 | 48191 |  49129 | 49129 |      37 |
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
| aethToken                                                              |             325 |    325 |    325 |    325 |       1 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| stake                                                                  |           28957 | 230887 | 268598 | 317110 |   27750 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| totalStaked                                                            |            2361 |   2361 |   2361 |   2361 |       3 |
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
| claim                                    |           28574 | 36489 |  36490 | 36725 |   32093 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| claimableAmount                          |            2508 |  2556 |   2556 |  2604 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalAllocated                           |             250 |   250 |    250 |   250 |       1 |
╰------------------------------------------+-----------------+-------+--------+-------+---------╯


Ran 2 test suites in 258.59s (249.40s CPU time): 37 tests passed, 0 failed, 0 skipped (37 total tests)
