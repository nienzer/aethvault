// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol"; 
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AetherVaultV3_Testnet is ERC721URIStorage, ReentrancyGuard, Ownable2Step, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public aethToken;
    address public treasuryAddress;
    address public stakingContractAddress;
    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;

    string public privatePlaceholderURI = "ipfs://private-aether-proof-metadata-placeholder";

    uint256 public totalCapsules;
    uint256 public totalProofs;
    uint256 public burnedAeth;
    uint256 private _tokenIds;

    // --- TESTNET: Batas ketidakaktifan diubah jadi 5 MENIT ---
    uint256 public constant MIN_INACTIVITY_LIMIT = 5 minutes;
    
    // Batas Maksimal Ciphertext (Sabuk Pengaman)
    uint256 public constant MAX_CIPHERTEXT_LENGTH = 10000;

    // Harga Paten Aether Proof
    uint256 public constant PROOF_COST = 200 ether;
    uint256 public constant PROOF_BURN = 40 ether;

    enum Tier { Basic, Premium, Eternal, Legacy }

    struct TierConfig {
        uint256 cost;
        uint256 burnPart;
        uint256 maxDuration;
    }
    mapping(Tier => TierConfig) public tierConfigs;

    struct Capsule {
        string title;
        string ciphertext;
        uint256 unlockTimestamp;
        address owner;
        Tier tier;
        bool isLegacy;
        address heirAddress;
        uint256 lastPingAlive;
        uint256 inactivityLimit;
        bool isClaimedOrRevealed;
        bool contentDeleted;
    }

    mapping(uint256 => Capsule) private capsules;
    mapping(address => uint256[]) private userCapsules;
    mapping(address => uint256[]) private heirCapsules;
    mapping(address => bytes) public encryptionPublicKeys;

    struct ProofMeta {
        string category;
        bytes32 fileHash;
        bool isPublic;
        uint256 timestamp;
    }
    mapping(uint256 => ProofMeta) public proofRegistry;
    mapping(bytes32 => bool) public usedHashes;

    event CapsuleSealed(uint256 indexed capsuleId, address indexed owner, Tier tier, uint256 cost);
    event ProofMinted(uint256 indexed tokenId, address indexed creator, string category, bool isPublic, bytes32 fileHash, string tokenURI, uint256 blockNumber);
    event CapsuleRevealed(uint256 indexed capsuleId, address indexed revealer);
    event LegacyClaimed(uint256 indexed capsuleId, address indexed heir);
    event PingRecorded(uint256 indexed capsuleId, address indexed owner, uint256 timestamp);
    event StakingContractSet(address indexed oldAddress, address indexed newAddress);
    event FeesDistributed(uint256 burnAmount, uint256 treasuryAmount, uint256 stakingAmount);

    constructor(address _aethToken, address _treasury, address _stakingContract) ERC721("Aether Proof", "APROOF") Ownable(msg.sender) {
        require(_aethToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_stakingContract != address(0), "Invalid staking address");

        aethToken = IERC20(_aethToken);
        treasuryAddress = _treasury;
        stakingContractAddress = _stakingContract;

        // --- TESTNET: maxDuration diubah jadi hitungan MENIT ---
        tierConfigs[Tier.Basic] = TierConfig(10 ether, 2 ether, 10 minutes);
        tierConfigs[Tier.Premium] = TierConfig(50 ether, 10 ether, 20 minutes);
        tierConfigs[Tier.Eternal] = TierConfig(200 ether, 40 ether, 30 minutes);
        tierConfigs[Tier.Legacy] = TierConfig(500 ether, 100 ether, 40 minutes);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function setPrivatePlaceholderURI(string memory _newURI) external onlyOwner {
        privatePlaceholderURI = _newURI;
    }

    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid staking address");
        emit StakingContractSet(stakingContractAddress, _stakingContract);
        stakingContractAddress = _stakingContract;
    }

    function setTierConfig(Tier _tier, uint256 _cost, uint256 _burnPart, uint256 _maxDuration) external onlyOwner {
        require(_cost > 0, "Cost must be > 0");
        require(_cost >= _burnPart, "Burn part exceeds total cost");
        tierConfigs[_tier] = TierConfig(_cost, _burnPart, _maxDuration);
    }

    function setTreasuryAddress(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryAddress = _newTreasury;
    }

    function recoverStuckTokens(address _tokenAddress, uint256 _amount) external onlyOwner {
        require(_tokenAddress != address(aethToken), "Cannot recover AETH");
        IERC20(_tokenAddress).safeTransfer(owner(), _amount);
    }

    function _distributeFees(uint256 _cost, uint256 _burnPart) internal {
        uint256 remainingFee = _cost - _burnPart;
        uint256 stakingShare = 0;
        uint256 treasuryShare = remainingFee;

        if (_burnPart > 0) {
            aethToken.safeTransferFrom(msg.sender, DEAD, _burnPart);
            burnedAeth += _burnPart;
        }

        if (stakingContractAddress != address(0) && remainingFee > 0) {
            stakingShare = remainingFee / 2;
            treasuryShare = remainingFee - stakingShare;
            aethToken.safeTransferFrom(msg.sender, stakingContractAddress, stakingShare);
        }

        if (treasuryShare > 0) {
            aethToken.safeTransferFrom(msg.sender, treasuryAddress, treasuryShare);
        }

        emit FeesDistributed(_burnPart, treasuryShare, stakingShare);
    }

    function createProof(string memory _category, bytes32 _fileHash, string memory _tokenURI, bool _isPublic) external nonReentrant whenNotPaused {
        require(bytes(_category).length > 0 && bytes(_category).length <= 50, "Invalid category");
        require(_fileHash != bytes32(0), "Invalid hash");
        require(bytes(_tokenURI).length > 0, "Empty URI");
        require(treasuryAddress != address(0), "Treasury not set");
        require(!usedHashes[_fileHash], "Proof already exists");

        require(aethToken.balanceOf(msg.sender) >= PROOF_COST, "Insufficient AETH balance");
        require(aethToken.allowance(msg.sender, address(this)) >= PROOF_COST, "Approve token first");

        _distributeFees(PROOF_COST, PROOF_BURN);

        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        usedHashes[_fileHash] = true;
        proofRegistry[newItemId] = ProofMeta({
            category: _category, fileHash: _fileHash, isPublic: _isPublic, timestamp: block.timestamp
        });

        totalProofs++;
        emit ProofMinted(newItemId, msg.sender, _category, _isPublic, _fileHash, _tokenURI, block.number);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address owner = ownerOf(tokenId); 

        if (!proofRegistry[tokenId].isPublic) {
            if (msg.sender != owner) {
                return privatePlaceholderURI;
            }
        }
        return super.tokenURI(tokenId);
    }

    function getProofDetails(uint256 _tokenId) external view returns (ProofMeta memory) {
        address tokenOwner = ownerOf(_tokenId);
        require(tokenOwner != address(0), "Proof does not exist");
        ProofMeta memory meta = proofRegistry[_tokenId];

        if (!meta.isPublic) {
            require(tokenOwner == msg.sender, "This proof is private and restricted");
        }
        return meta;
    }

    function registerPublicKey(bytes calldata _pubKey) external whenNotPaused {
        require(_pubKey.length > 0, "Empty key");
        require(_pubKey.length <= 512, "Key too long");
        encryptionPublicKeys[msg.sender] = _pubKey;
    }

    function sealTimeLockCapsule(Tier _tier, string calldata _title, string calldata _ciphertext, uint256 _unlockTimestamp) external nonReentrant whenNotPaused {
        require(_unlockTimestamp > block.timestamp, "Unlock time must be in future");
        _sealCapsule(_tier, _title, _ciphertext, _unlockTimestamp, false, address(0), 0);
    }

    function sealLegacyCapsule(string calldata _title, string calldata _ciphertext, uint256 _inactivityDuration, address _heirAddress) external nonReentrant whenNotPaused {
        require(_heirAddress != address(0) && _heirAddress != msg.sender, "Invalid heir address");
        require(_inactivityDuration >= MIN_INACTIVITY_LIMIT, "Durasi minimal 5 menit!"); // Teks Notifikasi Diubah
        _sealCapsule(Tier.Legacy, _title, _ciphertext, 0, true, _heirAddress, _inactivityDuration);
    }

    function _sealCapsule(Tier _tier, string memory _title, string memory _ciphertext, uint256 _unlockTimestamp, bool _isLegacy, address _heirAddress, uint256 _inactivityLimit) internal {
        require(bytes(_ciphertext).length <= MAX_CIPHERTEXT_LENGTH, "Ciphertext exceeds max length");
        
        TierConfig memory config = tierConfigs[_tier];

        if (!_isLegacy) {
            require(_unlockTimestamp <= block.timestamp + config.maxDuration, "Exceeds max duration");
        }

        require(aethToken.balanceOf(msg.sender) >= config.cost, "Insufficient AETH");
        require(aethToken.allowance(msg.sender, address(this)) >= config.cost, "Approve token first");

        _distributeFees(config.cost, config.burnPart);

        totalCapsules++;
        uint256 newCapsuleId = totalCapsules;

        capsules[newCapsuleId] = Capsule({
            title: _title,
            ciphertext: _ciphertext,
            unlockTimestamp: _unlockTimestamp,
            owner: msg.sender,
            tier: _tier,
            isLegacy: _isLegacy,
            heirAddress: _heirAddress,
            lastPingAlive: block.timestamp,
            inactivityLimit: _inactivityLimit,
            isClaimedOrRevealed: false,
            contentDeleted: false
        });

        userCapsules[msg.sender].push(newCapsuleId);
        if (_isLegacy) {
            heirCapsules[_heirAddress].push(newCapsuleId);
        }

        emit CapsuleSealed(newCapsuleId, msg.sender, _tier, config.cost);
    }

    function pingAlive(uint256 _capsuleIndex) external {
        require(capsules[_capsuleIndex].owner == msg.sender, "Not owner");
        require(!capsules[_capsuleIndex].isClaimedOrRevealed, "Capsule finished");
        capsules[_capsuleIndex].lastPingAlive = block.timestamp;
        emit PingRecorded(_capsuleIndex, msg.sender, block.timestamp);
    }

    function revealCapsule(uint256 _capsuleIndex) external nonReentrant returns (string memory) {
        Capsule storage cap = capsules[_capsuleIndex];
        require(cap.owner == msg.sender, "Not owner");
        require(!cap.isLegacy, "Use claimLegacy");
        require(block.timestamp >= cap.unlockTimestamp, "Capsule still locked");
        require(!cap.contentDeleted, "Content deleted");
        require(!cap.isClaimedOrRevealed, "Already revealed");

        cap.isClaimedOrRevealed = true;
        emit CapsuleRevealed(_capsuleIndex, msg.sender);
        return cap.ciphertext;
    }

    function claimLegacy(uint256 _capsuleIndex) external nonReentrant returns (string memory) {
        Capsule storage cap = capsules[_capsuleIndex];
        require(cap.isLegacy, "Not legacy");
        require(cap.heirAddress == msg.sender, "Not heir");
        require(block.timestamp >= (cap.lastPingAlive + cap.inactivityLimit), "Owner active");
        require(!cap.contentDeleted, "Content deleted");
        require(!cap.isClaimedOrRevealed, "Already claimed");

        cap.isClaimedOrRevealed = true;
        emit LegacyClaimed(_capsuleIndex, msg.sender);
        return cap.ciphertext;
    }

    function getOpenedCiphertext(uint256 _capsuleIndex) external view returns (string memory) {
        Capsule storage cap = capsules[_capsuleIndex];
        require(cap.isClaimedOrRevealed, "Not opened yet");
        require(!cap.contentDeleted, "Content deleted");

        bool isOwner = (msg.sender == cap.owner);
        bool isHeir = (cap.isLegacy && msg.sender == cap.heirAddress);
        require(isOwner || isHeir, "Not authorized");

        return cap.ciphertext;
    }

    function deleteOpenedContent(uint256 _capsuleIndex) external {
        Capsule storage cap = capsules[_capsuleIndex];
        require(cap.isClaimedOrRevealed, "Not opened yet");
        bool isOwner = (msg.sender == cap.owner);
        bool isHeir = (cap.isLegacy && msg.sender == cap.heirAddress);
        require(isOwner || isHeir, "Not authorized");

        cap.ciphertext = "";
        cap.title = "";
        cap.contentDeleted = true;
    }

    function getCapsuleMeta(uint256 _capsuleIndex) external view returns (
        string memory title, uint256 unlockTimestamp, address owner, Tier tier,
        bool isLegacy, address heirAddress, uint256 lastPingAlive, uint256 inactivityLimit,
        bool isClaimedOrRevealed, bool contentDeleted
    ) {
        Capsule storage cap = capsules[_capsuleIndex];
        return (cap.title, cap.unlockTimestamp, cap.owner, cap.tier, cap.isLegacy, cap.heirAddress, cap.lastPingAlive, cap.inactivityLimit, cap.isClaimedOrRevealed, cap.contentDeleted);
    }

    function isCapsuleReady(uint256 _capsuleIndex) external view returns (bool) {
        Capsule storage cap = capsules[_capsuleIndex];
        if (cap.contentDeleted || cap.isClaimedOrRevealed) return false;
        if (cap.isLegacy) {
            return block.timestamp >= (cap.lastPingAlive + cap.inactivityLimit);
        } else {
            return block.timestamp >= cap.unlockTimestamp;
        }
    }

    function getUserCapsulesPaginated(address _user, uint256 _offset, uint256 _limit) external view returns (uint256[] memory) {
        uint256 total = userCapsules[_user].length;
        if (_offset >= total) return new uint256[](0);

        uint256 end = _offset + _limit;
        if (end > total) end = total;

        uint256[] memory result = new uint256[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = userCapsules[_user][i];
        }
        return result;
    }

    function getHeirCapsulesPaginated(address _heir, uint256 _offset, uint256 _limit) external view returns (uint256[] memory) {
        uint256 total = heirCapsules[_heir].length;
        if (_offset >= total) return new uint256[](0);

        uint256 end = _offset + _limit;
        if (end > total) end = total;

        uint256[] memory result = new uint256[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = heirCapsules[_heir][i];
        }
        return result;
    }

    function getUserCapsuleCount(address _user) external view returns (uint256) {
        return userCapsules[_user].length;
    }

    function getHeirCapsuleCount(address _heir) external view returns (uint256) {
        return heirCapsules[_heir].length;
    }

    function getPlatformStats() external view returns (uint256 _totalCapsules, uint256 _totalProofs, uint256 _burnedAeth, uint256 _currentSupply) {
        return (totalCapsules, totalProofs, burnedAeth, aethToken.totalSupply());
    }
}