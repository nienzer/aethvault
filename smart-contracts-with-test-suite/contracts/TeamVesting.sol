// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TeamVesting (TESTNET VERSION)
 */
contract TeamVesting is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable aethToken;
    address public beneficiary;

    uint256 public immutable startTimestamp;
    uint256 public immutable cliff;
    uint256 public immutable duration;
    uint256 public immutable totalAllocated;

    uint256 public released;

    address public pendingBeneficiary;
    uint256 public beneficiaryChangeTime;
    // ⚡ TESTNET: Timelock dipangkas jadi 3 menit (Mainnet: 2 hari)
    uint256 public constant BENEFICIARY_CHANGE_DELAY = 3 minutes;

    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event BeneficiaryUpdated(address indexed oldBeneficiary, address indexed newBeneficiary);
    event BeneficiaryChangeRequested(address indexed current, address indexed pending, uint256 executeAfter);
    event BeneficiaryChangeCancelled(address indexed current);
    event ExcessTokenRescued(address indexed token, address indexed to, uint256 amount);

    constructor(
        address _token,
        address _beneficiary,
        uint256 _startTimestamp,
        uint256 _totalAllocated
    ) {
        require(_token != address(0), "Invalid token address");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_totalAllocated > 0, "Alokasi harus lebih dari 0");

        aethToken = IERC20(_token);
        beneficiary = _beneficiary;
        totalAllocated = _totalAllocated;

        startTimestamp = _startTimestamp == 0 ? block.timestamp : _startTimestamp;
        
        // ⚡ TESTNET: Cliff jadi 3 menit, total durasi habis di 10 menit
        cliff = startTimestamp + 3 minutes;
        duration = 10 minutes;
    }

    function requestBeneficiaryChange(address _newBeneficiary) external {
        require(msg.sender == beneficiary, "Hanya beneficiary yang bisa mengubah");
        require(_newBeneficiary != address(0), "Alamat baru tidak valid");
        require(_newBeneficiary != beneficiary, "Alamat sama dengan saat ini");

        pendingBeneficiary = _newBeneficiary;
        beneficiaryChangeTime = block.timestamp + BENEFICIARY_CHANGE_DELAY;

        emit BeneficiaryChangeRequested(beneficiary, _newBeneficiary, beneficiaryChangeTime);
    }

    function confirmBeneficiaryChange() external {
        require(msg.sender == pendingBeneficiary, "Hanya pending beneficiary yang bisa konfirmasi");
        require(block.timestamp >= beneficiaryChangeTime, "Timelock belum selesai");
        require(pendingBeneficiary != address(0), "Tidak ada perubahan yang pending");

        emit BeneficiaryUpdated(beneficiary, pendingBeneficiary);
        beneficiary = pendingBeneficiary;
        pendingBeneficiary = address(0);
        beneficiaryChangeTime = 0;
    }

    function cancelBeneficiaryChange() external {
        require(msg.sender == beneficiary, "Hanya beneficiary yang bisa membatalkan");
        require(pendingBeneficiary != address(0), "Tidak ada perubahan yang pending");

        pendingBeneficiary = address(0);
        beneficiaryChangeTime = 0;

        emit BeneficiaryChangeCancelled(beneficiary);
    }

    function vestedAmount(uint256 _timestamp) public view returns (uint256) {
        if (_timestamp < cliff) {
            return 0;
        } else if (_timestamp >= startTimestamp + duration) {
            return totalAllocated;
        } else {
            uint256 elapsedTime = _timestamp - startTimestamp;
            return (totalAllocated * elapsedTime) / duration;
        }
    }

    function claimableAmount() public view returns (uint256) {
        return vestedAmount(block.timestamp) - released;
    }

    function claim() external nonReentrant {
        require(msg.sender == beneficiary, "Hanya beneficiary yang bisa melakukan claim");

        uint256 unreleased = claimableAmount();
        require(unreleased > 0, "Belum ada token baru yang bisa di-claim");

        uint256 currentBalance = aethToken.balanceOf(address(this));
        require(currentBalance >= unreleased, "Saldo kontrak tidak mencukupi");

        released += unreleased;
        emit TokensClaimed(beneficiary, unreleased);

        aethToken.safeTransfer(beneficiary, unreleased);
    }

    function rescueExcessTokens(address _tokenAddress, address _to, uint256 _amount) external {
        require(msg.sender == beneficiary, "Hanya beneficiary");
        require(_to != address(0), "Alamat tidak valid");

        if (_tokenAddress == address(aethToken)) {
            uint256 currentBalance = aethToken.balanceOf(address(this));
            uint256 lockedAmount = totalAllocated - released;
            require(currentBalance - _amount >= lockedAmount, "Tidak bisa menarik dana vesting");
        }

        emit ExcessTokenRescued(_tokenAddress, _to, _amount);
        IERC20(_tokenAddress).safeTransfer(_to, _amount);
    }
}