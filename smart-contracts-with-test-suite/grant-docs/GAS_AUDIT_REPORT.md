No files changed, compilation skipped

Ran 10 tests for test/AethVaultFaucetV3.t.sol:AethVaultFaucetV3Test
[PASS] testFuzz_AdminOnly_Revert_NotOwner(address) (runs: 256, μ: 32835, ~: 32835)
[PASS] testFuzz_CanClaim_Logic(address) (runs: 256, μ: 117118, ~: 117118)
[PASS] testFuzz_Claim_Revert_Cooldown(address,uint256) (runs: 256, μ: 130443, ~: 130654)
[PASS] testFuzz_Claim_Revert_NoBalance() (gas: 45069)
[PASS] testFuzz_Claim_Revert_WhenPaused(address) (runs: 256, μ: 65859, ~: 65859)
[PASS] testFuzz_Reentrancy_Attack_Brutal() (gas: 233)
[PASS] testFuzz_SetClaimAmount_FatFinger_Revert(uint256) (runs: 256, μ: 38177, ~: 37917)
[PASS] testFuzz_SetClaimAmount_Valid(uint256) (runs: 256, μ: 43799, ~: 43540)
[PASS] testFuzz_Withdraw_And_Refill(uint256) (runs: 256, μ: 104090, ~: 103960)
[PASS] test_GasGriefing_MassClaim() (gas: 234)
Suite result: ok. 10 passed; 0 failed; 0 skipped; finished in 869.91ms (832.85ms CPU time)

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
Suite result: ok. 35 passed; 0 failed; 0 skipped; finished in 29.28ms (15.13ms CPU time)

Ran 2 tests for test/AetherVaultAudit.t.sol:AetherVaultStandardTest
[PASS] invariant_Core_Systems_Must_Be_Healthy() (runs: 256, calls: 128000, reverts: 0)

╭----------+-------------------------------+-------+---------+----------╮
| Contract | Selector                      | Calls | Reverts | Discards |
+=======================================================================+
| Handler  | ForgeTokenRandom              | 31825 | 0       | 0        |
|----------+-------------------------------+-------+---------+----------|
| Handler  | advanceTimeAndTryClaimvesting | 32232 | 0       | 0        |
|----------+-------------------------------+-------+---------+----------|
| Handler  | sealCapsuleRandomTime         | 32057 | 0       | 0        |
|----------+-------------------------------+-------+---------+----------|
| Handler  | stakeRandom                   | 31886 | 0       | 0        |
╰----------+-------------------------------+-------+---------+----------╯

[PASS] testFuzz_veAETH_IsSoulboundAndCannotBeTransferred(uint256) (runs: 256, μ: 3219, ~: 3219)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 27.74s (27.74s CPU time)

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
| AetherVaultBrutalHandler | attack_DonateDust       | 32224 | 0       | 0        |
|--------------------------+-------------------------+-------+---------+----------|
| AetherVaultBrutalHandler | attack_SpamTokenMinting | 32220 | 0       | 0        |
|--------------------------+-------------------------+-------+---------+----------|
| AetherVaultBrutalHandler | chaos_TimeWarp          | 32037 | 0       | 0        |
|--------------------------+-------------------------+-------+---------+----------|
| AetherVaultBrutalHandler | user_StakeTokens        | 31519 | 0       | 0        |
╰--------------------------+-------------------------+-------+---------+----------╯

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 194.94s (194.94s CPU time)

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
| approve                                  |           46324 | 46397 |  46396 | 46432 |   35222 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| balanceOf                                |             642 |  2587 |   2642 |  2642 |  104502 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalBurnedAeth                          |            2406 |  2406 |   2406 |  2406 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| totalSupply                              |            2370 |  2370 |   2370 |  2370 |       2 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| transfer                                 |           26747 | 36818 |  36757 | 53917 |   32660 |
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
| MAX_STAKE_PER_WALLET                                                   |             261 |    261 |    261 |    261 |   31645 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| aethToken                                                              |             325 |    325 |    325 |    325 |       1 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| stake                                                                  |           28957 | 249646 | 253462 | 394990 |    2872 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| totalStaked                                                            |            2361 |   2361 |   2361 |   2361 |       2 |
|------------------------------------------------------------------------+-----------------+--------+--------+--------+---------|
| userTotalStaked                                                        |            2584 |   2584 |   2584 |   2584 |   31645 |
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


Ran 4 test suites in 201.30s (223.59s CPU time): 48 tests passed, 0 failed, 0 skipped (48 total tests)
