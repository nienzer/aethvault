// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// 1. Template Token (Sangat aman, fixed supply)
contract AetherChildToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address owner) ERC20(name, symbol) {
        _mint(owner, initialSupply * (10 ** decimals()));
    }
}

// 2. Pabrik Utamanya (Production Ready V3 - With Burn & Split Fee Mechanism)
contract AetherForgeFactory is Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable aethToken;
    
    // Alamat Penerima Sesuai Ekosistem AetherVault
    address public treasuryAddress; 
    address public stakingContractAddress;

    uint256 public creationFee = 1000 * 10**18; // Default 1,000 AETH
    uint256 public constant MAX_CREATION_FEE = 10_000 * 10**18; 

    // --- TRACKING & REGISTRY ---
    address[] public allCreatedTokens;
    mapping(address => bool) public isVerifiedForgeToken; 
    mapping(address => address[]) public tokensByCreator; 

    // --- EVENTS ---
    event TokenCreated(
        address indexed tokenAddress, 
        address indexed creator, 
        string name, 
        string symbol, 
        uint256 initialSupply
    );
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event RecipientsUpdated(address indexed treasury, address indexed staking);
    event FeesDistributed(uint256 burnAmount, uint256 treasuryAmount, uint256 stakingAmount);

    constructor(
        address _aethAddress, 
        address _treasuryAddress, 
        address _stakingContractAddress, 
        uint256 _creationFee
    ) Ownable(msg.sender) {
        require(_aethAddress != address(0), "Invalid AETH address");
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_stakingContractAddress != address(0), "Invalid staking address");
        require(_creationFee <= MAX_CREATION_FEE, "Fee exceeds maximum limit");

        aethToken = IERC20(_aethAddress);
        treasuryAddress = _treasuryAddress;
        stakingContractAddress = _stakingContractAddress;
        creationFee = _creationFee;
    }

    // --- FUNGSI UTAMA CREATE TOKEN DENGAN 2% BURN & 50:50 SPLIT ---
    function createMyOwnToken(string memory _name, string memory _symbol, uint256 _initialSupply) external whenNotPaused returns (address) {
        require(bytes(_name).length > 0 && bytes(_name).length <= 50, "Nama tidak valid");
        require(bytes(_symbol).length > 0 && bytes(_symbol).length <= 10, "Simbol tidak valid");
        require(_initialSupply > 0 && _initialSupply <= 1_000_000_000_000, "Supply maksimum 1 Triliun"); 

        if (creationFee > 0) {
            // Hitung 2% untuk Burn (memicu totalBurnedAeth di AetherVault utama lewat fungsi burn)
            uint256 burnAmount = (creationFee * 2) / 100; // 20 AETH dari 1000 AETH
            uint256 remainingFee = creationFee - burnAmount; // 980 AETH
            
            uint256 stakingShare = remainingFee / 2;        // 490 AETH
            uint256 treasuryShare = remainingFee - stakingShare; // 490 AETH

            // 1. Tarik total fee dari user ke kontrak Factory terlebih dahulu
            aethToken.safeTransferFrom(msg.sender, address(this), creationFee);

           // 2. Eksekusi Burn (BENAR: Langsung panggil burn karena token sudah ada di Factory)
            if (burnAmount > 0) {
                ERC20Burnable(address(aethToken)).burn(burnAmount);
            }

            // 3. Kirim bagian ke Staking Contract
            if (stakingShare > 0) {
                aethToken.safeTransfer(stakingContractAddress, stakingShare);
            }

            // 4. Kirim bagian ke Treasury
            if (treasuryShare > 0) {
                aethToken.safeTransfer(treasuryAddress, treasuryShare);
            }

            emit FeesDistributed(burnAmount, treasuryShare, stakingShare);
        }

        AetherChildToken newToken = new AetherChildToken(_name, _symbol, _initialSupply, msg.sender);
        address tokenAddr = address(newToken);

        allCreatedTokens.push(tokenAddr);
        isVerifiedForgeToken[tokenAddr] = true;
        tokensByCreator[msg.sender].push(tokenAddr);

        emit TokenCreated(tokenAddr, msg.sender, _name, _symbol, _initialSupply);
        
        return tokenAddr;
    }

    // --- FUNGSI ADMIN ---
    function setFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_CREATION_FEE, "Fee too high");
        uint256 oldFee = creationFee;
        creationFee = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }

    function setRecipients(address _treasuryAddress, address _stakingContractAddress) external onlyOwner {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_stakingContractAddress != address(0), "Invalid staking address");
        treasuryAddress = _treasuryAddress;
        stakingContractAddress = _stakingContractAddress;
        emit RecipientsUpdated(_treasuryAddress, _stakingContractAddress);
    }

    function togglePause() external onlyOwner {
        paused() ? _unpause() : _pause();
    }

    // --- FUNGSI READ ---
    function getTokensByCreator(address _creator) external view returns (address[] memory) {
        return tokensByCreator[_creator];
    }

    function getTotalTokensCreated() external view returns (uint256) {
        return allCreatedTokens.length;
    }
}