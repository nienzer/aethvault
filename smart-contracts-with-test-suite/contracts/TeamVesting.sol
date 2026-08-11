// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TeamVesting (AetherVault Ecosystem - Fixed Allocation)
 * @dev Mengunci token developer dengan sistem "Linear Vesting with 6-Month Cliff".
 *      Vesting berjalan 24 bulan (730 hari). Tidak ada klaim di 6 bulan pertama.
 *      Total alokasi bersifat IMMUTABLE (Terkunci Permanen) demi kepercayaan investor.
 */
contract TeamVesting is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable aethToken;
    address public beneficiary;

    uint256 public immutable startTimestamp;
    uint256 public immutable cliff;
    uint256 public immutable duration;
    uint256 public immutable totalAllocated; // ✅ TRUE IMMUTABLE FIXED ALLOCATION

    uint256 public released; 

    // ==========================================
    // EVENTS
    // ==========================================
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event BeneficiaryUpdated(address indexed oldBeneficiary, address indexed newBeneficiary);
    event ExcessTokenRescued(address indexed token, address indexed to, uint256 amount);

    /**
     * @param _token Alamat smart contract Token AETH
     * @param _beneficiary Dompet pribadi developer
     * @param _startTimestamp Waktu mulai (0 = waktu deploy)
     * @param _totalAllocated Jumlah pasti token dev (Misal: 15.000.000 * 10**18)
     */
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
        totalAllocated = _totalAllocated; // ✅ Dikunci selamanya saat deploy

        startTimestamp = _startTimestamp == 0 ? block.timestamp : _startTimestamp;
        cliff = startTimestamp + 180 days; 
        duration = 730 days;               
    }

    function changeBeneficiary(address _newBeneficiary) external {
        require(msg.sender == beneficiary, "Hanya beneficiary yang bisa mengubah");
        require(_newBeneficiary != address(0), "Alamat baru tidak valid");
        emit BeneficiaryUpdated(beneficiary, _newBeneficiary);
        beneficiary = _newBeneficiary;
    }

    /**
     * @dev Perhitungan berdasarkan Fixed totalAllocated. Bebas dari risiko dana nyasar.
     */
    function vestedAmount(uint256 _timestamp) public view returns (uint256) {
        if (_timestamp < cliff) {
            return 0;
        } else if (_timestamp >= startTimestamp + duration) {
            return totalAllocated; // ✅ Dijamin maksimal cuma 15M
        } else {
            uint256 elapsedTime = _timestamp - startTimestamp;
            return (totalAllocated * elapsedTime) / duration; // ✅ Formula paten
        }
    }

    function claimableAmount() public view returns (uint256) {
        return vestedAmount(block.timestamp) - released;
    }

    function claim() external nonReentrant {
        require(msg.sender == beneficiary, "Hanya beneficiary yang bisa melakukan claim");
        
        uint256 unreleased = claimableAmount();
        require(unreleased > 0, "Belum ada token baru yang bisa di-claim");

        // ✅ Keamanan Ganda: Pastikan saldo kontrak cukup (jika terjadi anomali)
        uint256 currentBalance = aethToken.balanceOf(address(this));
        require(currentBalance >= unreleased, "Saldo kontrak tidak mencukupi (Tunggu transfer/funding)");

        released += unreleased; 
        emit TokensClaimed(beneficiary, unreleased);
        
        aethToken.safeTransfer(beneficiary, unreleased);
    }

    /**
     * @dev Fitur Penyelamatan. Karena alokasi fixed, sisa dana nyasar bisa ditarik tanpa menyentuh jatah vesting.
     */
    function rescueExcessTokens(address _tokenAddress, address _to, uint256 _amount) external {
        require(msg.sender == beneficiary, "Hanya beneficiary");
        require(_to != address(0), "Alamat tidak valid");

        if (_tokenAddress == address(aethToken)) {
            // Jika token AETH, pastikan tidak mengurangi saldo yang dikunci untuk vesting
            uint256 currentBalance = aethToken.balanceOf(address(this));
            uint256 lockedAmount = totalAllocated - released;
            require(currentBalance - _amount >= lockedAmount, "Tidak bisa menarik dana vesting");
        }
        
        emit ExcessTokenRescued(_tokenAddress, _to, _amount);
        IERC20(_tokenAddress).safeTransfer(_to, _amount);
    }
}