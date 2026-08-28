// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// 🔌 COLOKAN V5: security/ diganti jadi utils/
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AethVaultFaucetV3 is ReentrancyGuard, Pausable, Ownable { 
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenInstance;
    uint256 public claimAmount;
    uint256 public constant WAIT_TIME = 1 days;
    uint256 public constant MAX_CLAIM = 10000 ether; 

    mapping(address => uint256) public nextAccessTime;

    event FaucetClaimed(address indexed to, uint256 amount);
    event ClaimAmountUpdated(uint256 newAmount);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    // 🔌 COLOKAN V5: Wajib inisialisasi Ownable(msg.sender)
    constructor(address _tokenAddress, uint256 _claimAmount) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_claimAmount > 0 && _claimAmount <= MAX_CLAIM, "Claim amount invalid"); 

        tokenInstance = IERC20(_tokenAddress);
        claimAmount = _claimAmount;
    }

    function claim() external nonReentrant whenNotPaused { 
        require(block.timestamp >= nextAccessTime[msg.sender], "Please wait 24 hours");
        require(tokenInstance.balanceOf(address(this)) >= claimAmount, "Insufficient faucet balance");

        nextAccessTime[msg.sender] = block.timestamp + WAIT_TIME; // CEI Pattern
        tokenInstance.safeTransfer(msg.sender, claimAmount);

        emit FaucetClaimed(msg.sender, claimAmount);
    }

    function canClaim(address user) external view returns(bool) {
        return block.timestamp >= nextAccessTime[user] && 
               tokenInstance.balanceOf(address(this)) >= claimAmount && 
               !paused();
    }

    function setClaimAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0 && _newAmount <= MAX_CLAIM, "Amount invalid");
        claimAmount = _newAmount;
        
        emit ClaimAmountUpdated(_newAmount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawRemainingTokens() external onlyOwner {
        uint256 balance = tokenInstance.balanceOf(address(this));
        require(balance > 0, "No remaining balance");
        
        tokenInstance.safeTransfer(owner(), balance);
        
        emit EmergencyWithdrawal(owner(), balance);
    }
}