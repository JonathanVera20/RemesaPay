// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title RemesaPay
 * @dev Instant blockchain remittances to Ecuador with 0.5% fees
 * @notice This contract enables low-cost, instant remittances using USDC/USDT
 * 
 * Key Features:
 * - 0.5% protocol fee (vs 15% traditional)
 * - Phone number to address mapping
 * - Merchant verification system
 * - ENS subdomain integration
 * - Emergency controls
 * - Upgradeable architecture
 */
contract RemesaPay is 
    Initializable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    /// @dev Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @dev Protocol constants
    uint256 public constant PROTOCOL_FEE_BASIS_POINTS = 50; // 0.5%
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000;
    uint256 public constant MIN_REMITTANCE_AMOUNT = 10 * 1e6; // $10 USDC minimum
    uint256 public constant MAX_REMITTANCE_AMOUNT = 10000 * 1e6; // $10,000 USDC maximum
    uint256 public constant LARGE_AMOUNT_THRESHOLD = 1000 * 1e6; // $1,000 USDC
    uint256 public constant TIME_LOCK_DURATION = 24 hours; // Large amounts time-locked

    /// @dev Supported stablecoins
    mapping(address => bool) public supportedTokens;
    
    /// @dev Treasury address for protocol fees
    address public treasury;

    /// @dev Phone number hash to recipient address mapping
    mapping(bytes32 => address) public phoneToAddress;
    
    /// @dev ENS subdomain to address mapping
    mapping(string => address) public ensSubdomainToAddress;

    /// @dev Merchant registry
    struct Merchant {
        bool isActive;
        string name;
        string location;
        address cashWallet;
        uint256 totalVolume;
        uint256 commissionsEarned;
        uint256 registrationTime;
    }
    mapping(address => Merchant) public merchants;
    address[] public merchantList;

    /// @dev Remittance struct
    struct Remittance {
        address sender;
        bytes32 phoneHash;
        address token;
        uint256 amount;
        uint256 fee;
        uint256 netAmount;
        uint256 timestamp;
        uint256 unlockTime;
        bool isClaimed;
        bool isLargeAmount;
        string ensSubdomain;
    }
    mapping(uint256 => Remittance) public remittances;
    uint256 public remittanceCounter;

    /// @dev User limits and statistics
    struct UserStats {
        uint256 totalSent;
        uint256 totalReceived;
        uint256 dailySent;
        uint256 lastSendDate;
        bool isBlacklisted;
    }
    mapping(address => UserStats) public userStats;

    /// @dev Daily limits
    uint256 public constant DAILY_LIMIT = 50000 * 1e6; // $50,000 per day

    /// @dev Events
    event RemittanceSent(
        uint256 indexed remittanceId,
        address indexed sender,
        bytes32 indexed phoneHash,
        address token,
        uint256 amount,
        uint256 fee,
        string ensSubdomain
    );

    event RemittanceClaimed(
        uint256 indexed remittanceId,
        address indexed recipient,
        address indexed merchant,
        uint256 amount
    );

    event MerchantRegistered(
        address indexed merchant,
        string name,
        string location
    );

    event MerchantStatusUpdated(
        address indexed merchant,
        bool isActive
    );

    event PhoneNumberRegistered(
        bytes32 indexed phoneHash,
        address indexed user
    );

    event ENSSubdomainRegistered(
        string subdomain,
        address indexed user
    );

    event TokenSupportUpdated(
        address indexed token,
        bool isSupported
    );

    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury
    );

    event UserBlacklisted(
        address indexed user,
        bool isBlacklisted
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _treasury Treasury address for protocol fees
     * @param _admin Admin address
     * @param _usdc USDC token address
     * @param _usdt USDT token address (optional)
     */
    function initialize(
        address _treasury,
        address _admin,
        address _usdc,
        address _usdt
    ) external initializer {
        require(_treasury != address(0), "Invalid treasury");
        require(_admin != address(0), "Invalid admin");
        require(_usdc != address(0), "Invalid USDC");

        __ReentrancyGuard_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        treasury = _treasury;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);

        // Add supported tokens
        supportedTokens[_usdc] = true;
        if (_usdt != address(0)) {
            supportedTokens[_usdt] = true;
        }

        emit TokenSupportUpdated(_usdc, true);
        if (_usdt != address(0)) {
            emit TokenSupportUpdated(_usdt, true);
        }
    }

    /**
     * @dev Send remittance to a phone number
     * @param _phoneHash Keccak256 hash of recipient's phone number
     * @param _token Token address (USDC/USDT)
     * @param _amount Amount to send
     * @param _ensSubdomain Optional ENS subdomain for recipient
     */
    function sendRemittance(
        bytes32 _phoneHash,
        address _token,
        uint256 _amount,
        string calldata _ensSubdomain
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[_token], "Token not supported");
        require(_amount >= MIN_REMITTANCE_AMOUNT, "Amount too small");
        require(_amount <= MAX_REMITTANCE_AMOUNT, "Amount too large");
        require(!userStats[msg.sender].isBlacklisted, "Sender blacklisted");
        require(_phoneHash != bytes32(0), "Invalid phone hash");

        // Check daily limits
        _updateAndCheckDailyLimit(msg.sender, _amount);

        // Calculate fees
        uint256 fee = (_amount * PROTOCOL_FEE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR;
        uint256 netAmount = _amount - fee;

        // Check if this is a large amount requiring time lock
        bool isLargeAmount = _amount >= LARGE_AMOUNT_THRESHOLD;
        uint256 unlockTime = isLargeAmount ? block.timestamp + TIME_LOCK_DURATION : block.timestamp;

        // Transfer tokens from sender
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Transfer fee to treasury
        IERC20(_token).safeTransfer(treasury, fee);

        // Create remittance record
        uint256 remittanceId = remittanceCounter++;
        remittances[remittanceId] = Remittance({
            sender: msg.sender,
            phoneHash: _phoneHash,
            token: _token,
            amount: _amount,
            fee: fee,
            netAmount: netAmount,
            timestamp: block.timestamp,
            unlockTime: unlockTime,
            isClaimed: false,
            isLargeAmount: isLargeAmount,
            ensSubdomain: _ensSubdomain
        });

        // Update sender stats
        userStats[msg.sender].totalSent += _amount;

        emit RemittanceSent(
            remittanceId,
            msg.sender,
            _phoneHash,
            _token,
            _amount,
            fee,
            _ensSubdomain
        );
    }

    /**
     * @dev Send ETH remittance
     * @param _phoneHash Hash of recipient's phone number
     * @param _ensSubdomain Optional ENS subdomain for recipient
     */
    function sendRemittanceETH(
        bytes32 _phoneHash,
        string calldata _ensSubdomain
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        require(msg.value >= 0.001 ether, "Amount too small"); // 0.001 ETH minimum
        require(msg.value <= 10 ether, "Amount too large"); // 10 ETH maximum
        require(!userStats[msg.sender].isBlacklisted, "Sender blacklisted");
        require(_phoneHash != bytes32(0), "Invalid phone hash");

        uint256 _amount = msg.value;

        // Check daily limits (convert ETH to USD equivalent for limit checking)
        // For simplicity, we'll use a 1:1000 ETH:USD ratio for limit checking
        // In production, you'd want to use an oracle
        uint256 usdEquivalent = _amount * 2000 / 1 ether; // Assuming ~$2000 per ETH
        _updateAndCheckDailyLimit(msg.sender, usdEquivalent);

        // Calculate fees
        uint256 fee = (_amount * PROTOCOL_FEE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR;
        uint256 netAmount = _amount - fee;

        // Check if this is a large amount requiring time lock
        bool isLargeAmount = usdEquivalent >= LARGE_AMOUNT_THRESHOLD;
        uint256 unlockTime = isLargeAmount ? block.timestamp + TIME_LOCK_DURATION : block.timestamp;

        // Transfer fee to treasury
        (bool success, ) = treasury.call{value: fee}("");
        require(success, "Fee transfer failed");

        // Create remittance record (using zero address for ETH)
        uint256 remittanceId = remittanceCounter++;
        remittances[remittanceId] = Remittance({
            sender: msg.sender,
            phoneHash: _phoneHash,
            token: address(0), // Use zero address for ETH
            amount: _amount,
            fee: fee,
            netAmount: netAmount,
            timestamp: block.timestamp,
            unlockTime: unlockTime,
            isClaimed: false,
            isLargeAmount: isLargeAmount,
            ensSubdomain: _ensSubdomain
        });

        // Update sender stats
        userStats[msg.sender].totalSent += usdEquivalent;

        emit RemittanceSent(
            remittanceId,
            msg.sender,
            _phoneHash,
            address(0), // ETH represented as zero address
            _amount,
            fee,
            _ensSubdomain
        );
    }

    /**
     * @dev Claim remittance (called by merchant on behalf of recipient)
     * @param _remittanceId Remittance ID to claim
     * @param _recipient Recipient address
     * @param _signature Recipient's signature authorizing the claim
     */
    function claimRemittance(
        uint256 _remittanceId,
        address _recipient,
        bytes calldata _signature
    ) external nonReentrant whenNotPaused {
        require(merchants[msg.sender].isActive, "Not active merchant");
        require(_recipient != address(0), "Invalid recipient");
        require(!userStats[_recipient].isBlacklisted, "Recipient blacklisted");

        Remittance storage remittance = remittances[_remittanceId];
        require(!remittance.isClaimed, "Already claimed");
        require(block.timestamp >= remittance.unlockTime, "Still time-locked");

        // Verify recipient owns the phone number
        require(phoneToAddress[remittance.phoneHash] == _recipient, "Phone not registered");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encodePacked(_remittanceId, msg.sender, _recipient))
        ));
        require(messageHash.recover(_signature) == _recipient, "Invalid signature");

        // Mark as claimed
        remittance.isClaimed = true;

        // Transfer tokens/ETH to merchant
        if (remittance.token == address(0)) {
            // ETH transfer
            (bool success, ) = msg.sender.call{value: remittance.netAmount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 token transfer
            IERC20(remittance.token).safeTransfer(msg.sender, remittance.netAmount);
        }

        // Update stats
        userStats[_recipient].totalReceived += remittance.netAmount;
        merchants[msg.sender].totalVolume += remittance.netAmount;
        merchants[msg.sender].commissionsEarned += remittance.fee / 4; // 25% commission for merchant

        emit RemittanceClaimed(_remittanceId, _recipient, msg.sender, remittance.netAmount);
    }

    /**
     * @dev Register phone number to address mapping
     * @param _phoneHash Keccak256 hash of phone number
     */
    function registerPhoneNumber(bytes32 _phoneHash) external {
        require(_phoneHash != bytes32(0), "Invalid phone hash");
        require(phoneToAddress[_phoneHash] == address(0), "Phone already registered");
        require(!userStats[msg.sender].isBlacklisted, "User blacklisted");

        phoneToAddress[_phoneHash] = msg.sender;
        
        emit PhoneNumberRegistered(_phoneHash, msg.sender);
    }

    /**
     * @dev Register ENS subdomain
     * @param _subdomain ENS subdomain (e.g., "user" for user.remesa.eth)
     */
    function registerENSSubdomain(string calldata _subdomain) external {
        require(bytes(_subdomain).length > 0, "Invalid subdomain");
        require(ensSubdomainToAddress[_subdomain] == address(0), "Subdomain taken");
        require(!userStats[msg.sender].isBlacklisted, "User blacklisted");

        ensSubdomainToAddress[_subdomain] = msg.sender;
        
        emit ENSSubdomainRegistered(_subdomain, msg.sender);
    }

    /**
     * @dev Register as merchant
     * @param _name Merchant name
     * @param _location Merchant location
     * @param _cashWallet Wallet address for cash management
     */
    function registerMerchant(
        string calldata _name,
        string calldata _location,
        address _cashWallet
    ) external {
        require(bytes(_name).length > 0, "Invalid name");
        require(bytes(_location).length > 0, "Invalid location");
        require(_cashWallet != address(0), "Invalid cash wallet");
        require(!merchants[msg.sender].isActive, "Already registered");
        require(!userStats[msg.sender].isBlacklisted, "User blacklisted");

        merchants[msg.sender] = Merchant({
            isActive: true,
            name: _name,
            location: _location,
            cashWallet: _cashWallet,
            totalVolume: 0,
            commissionsEarned: 0,
            registrationTime: block.timestamp
        });

        merchantList.push(msg.sender);
        _grantRole(MERCHANT_ROLE, msg.sender);

        emit MerchantRegistered(msg.sender, _name, _location);
    }

    /**
     * @dev Batch send remittances (gas optimization)
     * @param _remittanceData Array of remittance data
     */
    struct BatchRemittanceData {
        bytes32 phoneHash;
        address token;
        uint256 amount;
        string ensSubdomain;
    }

    function batchSendRemittances(
        BatchRemittanceData[] calldata _remittanceData
    ) external nonReentrant whenNotPaused {
        require(_remittanceData.length > 0, "Empty batch");
        require(_remittanceData.length <= 50, "Batch too large");
        require(!userStats[msg.sender].isBlacklisted, "Sender blacklisted");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _remittanceData.length; i++) {
            totalAmount += _remittanceData[i].amount;
        }

        _updateAndCheckDailyLimit(msg.sender, totalAmount);

        for (uint256 i = 0; i < _remittanceData.length; i++) {
            BatchRemittanceData calldata data = _remittanceData[i];
            
            require(supportedTokens[data.token], "Token not supported");
            require(data.amount >= MIN_REMITTANCE_AMOUNT, "Amount too small");
            require(data.amount <= MAX_REMITTANCE_AMOUNT, "Amount too large");
            require(data.phoneHash != bytes32(0), "Invalid phone hash");

            uint256 fee = (data.amount * PROTOCOL_FEE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR;
            uint256 netAmount = data.amount - fee;

            bool isLargeAmount = data.amount >= LARGE_AMOUNT_THRESHOLD;
            uint256 unlockTime = isLargeAmount ? block.timestamp + TIME_LOCK_DURATION : block.timestamp;

            IERC20(data.token).safeTransferFrom(msg.sender, address(this), data.amount);
            IERC20(data.token).safeTransfer(treasury, fee);

            uint256 remittanceId = remittanceCounter++;
            remittances[remittanceId] = Remittance({
                sender: msg.sender,
                phoneHash: data.phoneHash,
                token: data.token,
                amount: data.amount,
                fee: fee,
                netAmount: netAmount,
                timestamp: block.timestamp,
                unlockTime: unlockTime,
                isClaimed: false,
                isLargeAmount: isLargeAmount,
                ensSubdomain: data.ensSubdomain
            });

            emit RemittanceSent(
                remittanceId,
                msg.sender,
                data.phoneHash,
                data.token,
                data.amount,
                fee,
                data.ensSubdomain
            );
        }

        userStats[msg.sender].totalSent += totalAmount;
    }

    // Admin functions

    /**
     * @dev Update treasury address
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address _newTreasury) external onlyRole(ADMIN_ROLE) {
        require(_newTreasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    /**
     * @dev Update token support
     * @param _token Token address
     * @param _isSupported Whether token is supported
     */
    function updateTokenSupport(address _token, bool _isSupported) external onlyRole(ADMIN_ROLE) {
        require(_token != address(0), "Invalid token");
        supportedTokens[_token] = _isSupported;
        emit TokenSupportUpdated(_token, _isSupported);
    }

    /**
     * @dev Update merchant status
     * @param _merchant Merchant address
     * @param _isActive Whether merchant is active
     */
    function updateMerchantStatus(address _merchant, bool _isActive) external onlyRole(ADMIN_ROLE) {
        require(merchants[_merchant].registrationTime > 0, "Merchant not registered");
        merchants[_merchant].isActive = _isActive;
        
        if (_isActive) {
            _grantRole(MERCHANT_ROLE, _merchant);
        } else {
            _revokeRole(MERCHANT_ROLE, _merchant);
        }

        emit MerchantStatusUpdated(_merchant, _isActive);
    }

    /**
     * @dev Blacklist/unblacklist user
     * @param _user User address
     * @param _isBlacklisted Whether user is blacklisted
     */
    function updateUserBlacklist(address _user, bool _isBlacklisted) external onlyRole(ADMIN_ROLE) {
        require(_user != address(0), "Invalid user");
        userStats[_user].isBlacklisted = _isBlacklisted;
        emit UserBlacklisted(_user, _isBlacklisted);
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Emergency unpause
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal (only when paused)
     * @param _token Token to withdraw
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyRole(ADMIN_ROLE) whenPaused {
        require(_token != address(0), "Invalid token");
        IERC20(_token).safeTransfer(treasury, _amount);
    }

    // Internal functions

    /**
     * @dev Update and check daily sending limit
     * @param _user User address
     * @param _amount Amount being sent
     */
    function _updateAndCheckDailyLimit(address _user, uint256 _amount) internal {
        UserStats storage stats = userStats[_user];
        
        // Reset daily counter if it's a new day
        if (block.timestamp / 1 days != stats.lastSendDate / 1 days) {
            stats.dailySent = 0;
            stats.lastSendDate = block.timestamp;
        }

        require(stats.dailySent + _amount <= DAILY_LIMIT, "Daily limit exceeded");
        stats.dailySent += _amount;
    }

    /**
     * @dev Authorize upgrade (only UPGRADER_ROLE)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    // View functions

    /**
     * @dev Get remittance details
     * @param _remittanceId Remittance ID
     */
    function getRemittance(uint256 _remittanceId) external view returns (Remittance memory) {
        return remittances[_remittanceId];
    }

    /**
     * @dev Get merchant details
     * @param _merchant Merchant address
     */
    function getMerchant(address _merchant) external view returns (Merchant memory) {
        return merchants[_merchant];
    }

    /**
     * @dev Get all merchants
     */
    function getAllMerchants() external view returns (address[] memory) {
        return merchantList;
    }

    /**
     * @dev Get user statistics
     * @param _user User address
     */
    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    /**
     * @dev Check if phone number is registered
     * @param _phoneHash Phone number hash
     */
    function isPhoneRegistered(bytes32 _phoneHash) external view returns (bool) {
        return phoneToAddress[_phoneHash] != address(0);
    }

    /**
     * @dev Check if ENS subdomain is available
     * @param _subdomain ENS subdomain
     */
    function isENSSubdomainAvailable(string calldata _subdomain) external view returns (bool) {
        return ensSubdomainToAddress[_subdomain] == address(0);
    }

    /**
     * @dev Get contract version for upgrade tracking
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
