// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract veAETH is ERC20, ERC20Votes, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable aethToken;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _aethToken)
        ERC20("Vote-Escrowed AETH", "veAETH")
        EIP712("Vote-Escrowed AETH", "1") // <-- TAMBAHAN INI AGAR EIP712 TERINISIALISASI
    {
        require(_aethToken != address(0), "Alamat token utama tidak valid");
        aethToken = IERC20(_aethToken);
    }

    /// @dev Menyegel token menjadi Soulbound (hanya bisa dicetak dan dihanguskan)
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        require(from == address(0) || to == address(0), "veAETH is Soulbound: Tidak bisa ditransfer antar wallet");
        super._update(from, to, value);
    }

    /// @notice Kunci AETH untuk cetak veAETH (Rasio 1:1)
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Jumlah deposit harus lebih dari 0");
        
        aethToken.safeTransferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
        
        emit Deposited(msg.sender, _amount);
    }

    /// @notice Hanguskan veAETH untuk tarik AETH kembali (Rasio 1:1)
    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Jumlah withdraw harus lebih dari 0");
        
        _burn(msg.sender, _amount);
        aethToken.safeTransfer(msg.sender, _amount);
        
        emit Withdrawn(msg.sender, _amount);
    }
}