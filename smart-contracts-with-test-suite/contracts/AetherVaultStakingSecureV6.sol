// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AetherVaultStakingSecure V6 (Post-Audit - TESTNET VERSION)
 */
contract AetherVaultStakingSecureV6 is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable aethToken;

    error InvalidAddress();
    error ZeroAmount();
    error InsufficientStake();
    error InsufficientContractBalance();
    error NoRewardToClaim();
    error RewardPoolEmpty();
    error CannotRescueStakedToken();
    error TransferFailed();
    error InvalidTier();
    error ExceedsMaxCap();
    error ExceedsMaxDeposits();
    error TokenStillLocked();
    error DepositNotFound();
    error ExceedsMaxApy();
    error InvalidLockDuration();
    error NoPendingUpdate();
    error TimelockNotExpired();
    error TokenAmountMismatch();

    uint256 public constant MAX_STAKE_PER_WALLET = 50_000 * 10**18;
    uint256 public constant MAX_DEPOSITS_PER_WALLET = 50;
    uint256 public constant MAX_APY_BPS = 2000; 
    uint256 public constant MAX_LOCK_DURATION = 365 days; // Tetap 365 days sbg batas atas
    // ⚡ TESTNET: Timelock dipangkas jadi 3 menit (Mainnet: 48 jam)
    uint256 public constant TIMELOCK_DURATION = 3 minutes;

    struct Tier {
        uint256 apy;
        uint256 lockDuration;
    }

    struct TierUpdate {
        uint256 apy;
        uint256 lockDuration;
        uint256 executeAfter;
        bool pending;
    }

    struct Deposit {
        uint256 id;
        uint256 tierId;
        uint256 amount;
        uint256 lastClaimTime;
        uint256 unlockTime;
        uint256 apy;
    }

    mapping(uint256 => Tier) public tiers;
    mapping(uint256 => TierUpdate) public pendingTierUpdates;
    mapping(address => Deposit[]) public userDeposits;
    mapping(address => uint256) public userTotalStaked;
    mapping(address => uint256) public userRewardDebt;

    uint256 public nextDepositId;

    uint256 public totalStaked;
    uint256 public totalRewardClaimed;
    uint256 public totalStakers;
    mapping(address => bool) private hasStaked;

    event Staked(address indexed user, uint256 tierId, uint256 amount, uint256 depositId, uint256 apy);
    event Withdrawn(address indexed user, uint256 depositId, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event PoolFunded(address indexed funder, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 depositId, uint256 amount, uint256 forfeitedReward);
    event DepositRemoved(address indexed user, uint256 depositId);
    event TierUpdateRequested(uint256 indexed tierId, uint256 apy, uint256 lockDuration, uint256 executeAfter);
    event TierUpdated(uint256 indexed tierId, uint256 apy, uint256 lockDuration);
    event ForeignTokenRescued(address indexed token, address indexed to, uint256 amount);

    constructor(address _aethTokenAddress) Ownable(msg.sender) {
        if (_aethTokenAddress == address(0)) revert InvalidAddress();
        aethToken = IERC20(_aethTokenAddress);

        // ⚡ TESTNET: Waktu staking tier diubah ke menit biar cepat cair di UI
        tiers[0] = Tier(400, 0);          // 4% APY, no lock
        tiers[1] = Tier(800, 3 minutes);  // 8% APY, 3 menit
        tiers[2] = Tier(1400, 5 minutes); // 14% APY, 5 menit
        tiers[3] = Tier(2000, 10 minutes);// 20% APY, 10 menit
    }

    function _findDepositIndex(address _user, uint256 _depositId) internal view returns (uint256) {
        Deposit[] storage deps = userDeposits[_user];
        for (uint256 i = 0; i < deps.length; i++) {
            if (deps[i].id == _depositId) {
                return i;
            }
        }
        revert DepositNotFound();
    }

    function _removeDepositByIndex(address _user, uint256 _index) internal {
        Deposit[] storage deps = userDeposits[_user];
        uint256 depositId = deps[_index].id;
        uint256 lastIndex = deps.length - 1;
        if (_index != lastIndex) {
            deps[_index] = deps[lastIndex];
        }
        deps.pop();
        emit DepositRemoved(_user, depositId);
    }

    function _syncUserRewards(address _user, bool _exclude, uint256 _excludeId) internal {
        Deposit[] storage deps = userDeposits[_user];
        uint256 newRewards = 0;
        for (uint256 i = 0; i < deps.length; i++) {
            if (deps[i].amount > 0) {
                if (_exclude && deps[i].id == _excludeId) continue;
                uint256 timeStaked = block.timestamp - deps[i].lastClaimTime;
                if (timeStaked > 0) {
                    uint256 lockedApy = deps[i].apy;
                    newRewards += (deps[i].amount * lockedApy * timeStaked) / (10000 * 365 days);
                    deps[i].lastClaimTime = block.timestamp;
                }
            }
        }
        userRewardDebt[_user] += newRewards;
    }

    function calculateReward(address _user) public view returns (uint256) {
        uint256 total = userRewardDebt[_user];
        Deposit[] memory deps = userDeposits[_user];
        for (uint256 i = 0; i < deps.length; i++) {
            if (deps[i].amount > 0) {
                uint256 timeStaked = block.timestamp - deps[i].lastClaimTime;
                uint256 lockedApy = deps[i].apy;
                total += (deps[i].amount * lockedApy * timeStaked) / (10000 * 365 days);
            }
        }
        return total;
    }

    function getUserDeposits(address _user) external view returns (Deposit[] memory) {
        return userDeposits[_user];
    }

    function getUserDepositsPaginated(address _user, uint256 _offset, uint256 _limit) external view returns (Deposit[] memory) {
        uint256 total = userDeposits[_user].length;
        if (_offset >= total) return new Deposit[](0);
        uint256 end = _offset + _limit;
        if (end > total) end = total;
        Deposit[] memory result = new Deposit[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = userDeposits[_user][i];
        }
        return result;
    }

    function getUserDepositCount(address _user) external view returns (uint256) {
        return userDeposits[_user].length;
    }

    function availableRewardPool() public view returns (uint256) {
        uint256 balance = aethToken.balanceOf(address(this));
        if (balance <= totalStaked) return 0;
        return balance - totalStaked;
    }

    function stake(uint256 _tierId, uint256 _amount) external nonReentrant whenNotPaused {
        if (_amount == 0) revert ZeroAmount();
        if (_tierId > 3) revert InvalidTier();
        if (userTotalStaked[msg.sender] + _amount > MAX_STAKE_PER_WALLET) revert ExceedsMaxCap();
        if (userDeposits[msg.sender].length >= MAX_DEPOSITS_PER_WALLET) revert ExceedsMaxDeposits();

        _syncUserRewards(msg.sender, false, 0);

        if (!hasStaked[msg.sender]) {
            hasStaked[msg.sender] = true;
            totalStakers += 1;
        }

        uint256 currentApy = tiers[_tierId].apy;
        uint256 unlockTime = block.timestamp + tiers[_tierId].lockDuration;
        uint256 depositId = nextDepositId++;

        userDeposits[msg.sender].push(Deposit({
            id: depositId,
            tierId: _tierId,
            amount: _amount,
            lastClaimTime: block.timestamp,
            unlockTime: unlockTime,
            apy: currentApy
        }));

        userTotalStaked[msg.sender] += _amount;
        totalStaked += _amount;

        uint256 balanceBefore = aethToken.balanceOf(address(this));
        aethToken.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 balanceAfter = aethToken.balanceOf(address(this));
        if (balanceAfter - balanceBefore != _amount) revert TokenAmountMismatch();

        emit Staked(msg.sender, _tierId, _amount, depositId, currentApy);
    }

    function withdraw(uint256 _depositId, uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroAmount();
        uint256 index = _findDepositIndex(msg.sender, _depositId);
        Deposit storage dep = userDeposits[msg.sender][index];
        if (dep.amount < _amount) revert InsufficientStake();
        if (block.timestamp < dep.unlockTime) revert TokenStillLocked();

        _syncUserRewards(msg.sender, false, 0);

        dep.amount -= _amount;
        userTotalStaked[msg.sender] -= _amount;
        totalStaked -= _amount;

        if (dep.amount == 0) {
            _removeDepositByIndex(msg.sender, index);
        }

        aethToken.safeTransfer(msg.sender, _amount);

        if (userTotalStaked[msg.sender] == 0 && hasStaked[msg.sender]) {
            hasStaked[msg.sender] = false;
            totalStakers -= 1;
        }

        emit Withdrawn(msg.sender, _depositId, _amount);
    }

    function claimReward() external nonReentrant whenNotPaused {
        _syncUserRewards(msg.sender, false, 0);
        uint256 reward = userRewardDebt[msg.sender];
        if (reward == 0) revert NoRewardToClaim();
        if (availableRewardPool() < reward) revert RewardPoolEmpty();

        userRewardDebt[msg.sender] = 0;
        totalRewardClaimed += reward;

        aethToken.safeTransfer(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    function emergencyWithdraw(uint256 _depositId) external nonReentrant {
        uint256 index = _findDepositIndex(msg.sender, _depositId);
        Deposit storage dep = userDeposits[msg.sender][index];
        if (dep.amount == 0) revert InsufficientStake();

        uint256 timeStaked = block.timestamp - dep.lastClaimTime;
        uint256 forfeitedReward = (dep.amount * dep.apy * timeStaked) / (10000 * 365 days);

        _syncUserRewards(msg.sender, true, _depositId);

        uint256 amount = dep.amount;
        _removeDepositByIndex(msg.sender, index);

        userTotalStaked[msg.sender] -= amount;
        totalStaked -= amount;

        aethToken.safeTransfer(msg.sender, amount);

        if (userTotalStaked[msg.sender] == 0 && hasStaked[msg.sender]) {
            hasStaked[msg.sender] = false;
            totalStakers -= 1;
        }

        emit EmergencyWithdrawn(msg.sender, _depositId, amount, forfeitedReward);
    }

    function fundRewardPool(uint256 _amount) external onlyOwner {
        if (_amount == 0) revert ZeroAmount();
        uint256 balanceBefore = aethToken.balanceOf(address(this));
        aethToken.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 balanceAfter = aethToken.balanceOf(address(this));
        if (balanceAfter - balanceBefore != _amount) revert TokenAmountMismatch();
        emit PoolFunded(msg.sender, _amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function requestTierUpdate(uint256 _tierId, uint256 _apy, uint256 _lockDuration) external onlyOwner {
        if (_tierId > 3) revert InvalidTier();
        if (_apy > MAX_APY_BPS) revert ExceedsMaxApy();
        if (_lockDuration > MAX_LOCK_DURATION) revert InvalidLockDuration();

        uint256 executeTime = block.timestamp + TIMELOCK_DURATION;
        pendingTierUpdates[_tierId] = TierUpdate(_apy, _lockDuration, executeTime, true);
        emit TierUpdateRequested(_tierId, _apy, _lockDuration, executeTime);
    }

    function executeTierUpdate(uint256 _tierId) external onlyOwner {
        TierUpdate memory update = pendingTierUpdates[_tierId];
        if (!update.pending) revert NoPendingUpdate();
        if (block.timestamp < update.executeAfter) revert TimelockNotExpired();

        tiers[_tierId] = Tier(update.apy, update.lockDuration);
        delete pendingTierUpdates[_tierId];
        emit TierUpdated(_tierId, update.apy, update.lockDuration);
    }

    function rescueForeignERC20(address _token, address _to, uint256 _amount) external onlyOwner {
        if (_token == address(aethToken)) revert CannotRescueStakedToken();
        if (_to == address(0)) revert InvalidAddress();
        if (_amount == 0) revert ZeroAmount();
        emit ForeignTokenRescued(_token, _to, _amount);
        IERC20(_token).safeTransfer(_to, _amount);
    }
}