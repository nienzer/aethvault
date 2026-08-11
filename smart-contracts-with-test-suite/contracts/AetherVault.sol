// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; 
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AetherVault (AETH) - Base Token Contract
 * @dev Murni berfungsi sebagai token ERC20 Induk. 
 *      Logika Kapsul dan Proof sudah dipindahkan ke AetherVaultV3.
 */
contract AetherVault is ERC20, ERC20Burnable, Ownable2Step, Pausable {
    using SafeERC20 for IERC20; 

    // Versioning
    string public constant VERSION = "3.0.1"; // ✅ Minor update

    address public treasuryWallet;
    
    // STATISTIK TOKEN
    uint256 public totalBurnedAeth;

    // ==========================================
    // EVENTS 
    // ==========================================
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ForeignTokenRescued(address indexed token, address indexed to, uint256 amount);
    event NativeCoinRescued(address indexed to, uint256 amount);
    event BurnRecorded(address indexed burner, uint256 amount, uint256 totalBurned);

    constructor(
        address initialLiquidityPool,
        address stakingRewardsWallet,
        address initialSaleWallet,
        address teamWallet,
        address _treasuryWallet
    ) ERC20("AetherVault", "AETH") Ownable(msg.sender) {
        require(_treasuryWallet != address(0), "Treasury wallet tidak boleh 0");
        treasuryWallet = _treasuryWallet;

        uint256 initialSupply = 100000000 * 10 ** decimals();
        
        // Distribusi Tokenomics Tetap Sama
        _mint(initialLiquidityPool, (initialSupply * 30) / 100);
        _mint(stakingRewardsWallet, (initialSupply * 25) / 100);
        _mint(initialSaleWallet, (initialSupply * 20) / 100);
        _mint(teamWallet, (initialSupply * 15) / 100);
        _mint(_treasuryWallet, (initialSupply * 10) / 100);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Alamat tidak valid");
        emit TreasuryUpdated(treasuryWallet, _newTreasury);
        treasuryWallet = _newTreasury;
    }

    // Perlindungan Aset
    function rescueForeignERC20(address _token, address _to, uint256 _amount) external onlyOwner {
        require(_token != address(this), "Tidak boleh menarik token AETH milik kontrak ini sendiri");
        require(_to != address(0), "Alamat tujuan tidak valid");
        emit ForeignTokenRescued(_token, _to, _amount);
        IERC20(_token).safeTransfer(_to, _amount);
    }

    function rescueNativeCoin(address payable _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Alamat tujuan tidak valid");
        emit NativeCoinRescued(_to, _amount);
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transfer native coin gagal");
    }

    // Pelacakan Burn Universal
    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
        
        // Deteksi jika ini adalah transaksi BURN (Kirim ke address 0)
        if (to == address(0) && from != address(0)) {
            totalBurnedAeth += value;
            emit BurnRecorded(from, value, totalBurnedAeth); 
        }
    }

    // Utilitas Getter untuk UI Dashboard Utama
    function getTokenStats() external view returns (
        uint256 burnedAeth,
        uint256 currentSupply
    ) {
        return (totalBurnedAeth, totalSupply());
    }

    // ✅ Tambahan agar kontrak bisa menerima BNB/Native Coin untuk skenario rescue
    receive() external payable {}
}