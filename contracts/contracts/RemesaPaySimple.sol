// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title RemesaPaySimple
 * @dev Simplified non-upgradeable version for testing
 */
contract RemesaPaySimple is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Constants
    uint256 public constant PROTOCOL_FEE_BASIS_POINTS = 50; // 0.5%
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000;
    uint256 public constant MIN_REMITTANCE_AMOUNT = 10 * 1e6; // $10 USDC
    uint256 public constant MAX_REMITTANCE_AMOUNT = 10000 * 1e6; // $10,000 USDC

    // State variables
    IERC20 public immutable usdcToken;
    address public treasury;
    uint256 public remittanceCounter;

    // Mappings
    mapping(bytes32 => address) public phoneToAddress;
    mapping(address => bool) public merchants;
    mapping(uint256 => Remittance) public remittances;

    struct Remittance {
        address sender;
        bytes32 phoneHash;
        address token;
        uint256 amount;
        uint256 fee;
        uint256 netAmount;
        uint256 timestamp;
        bool isClaimed;
        string ensSubdomain;
    }

    // Events
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

    event MerchantRegistered(address indexed merchant, string name);
    event PhoneNumberRegistered(bytes32 indexed phoneHash, address indexed user);

    constructor(address _usdcToken, address _treasury) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid USDC");
        require(_treasury != address(0), "Invalid treasury");
        
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
    }

    function registerMerchant(string calldata _name, string calldata _location) external {
        require(bytes(_name).length > 0, "Invalid name");
        require(!merchants[msg.sender], "Already registered");
        
        merchants[msg.sender] = true;
        emit MerchantRegistered(msg.sender, _name);
    }

    function registerPhoneNumber(bytes32 _phoneHash) external {
        require(_phoneHash != bytes32(0), "Invalid phone hash");
        require(phoneToAddress[_phoneHash] == address(0), "Already registered");
        
        phoneToAddress[_phoneHash] = msg.sender;
        emit PhoneNumberRegistered(_phoneHash, msg.sender);
    }

    function sendRemittance(
        bytes32 _phoneHash,
        address _token,
        uint256 _amount,
        string calldata _ensSubdomain
    ) external nonReentrant whenNotPaused {
        require(_token == address(usdcToken), "Only USDC supported");
        require(_amount >= MIN_REMITTANCE_AMOUNT, "Amount too small");
        require(_amount <= MAX_REMITTANCE_AMOUNT, "Amount too large");
        require(_phoneHash != bytes32(0), "Invalid phone hash");

        // Calculate fees
        uint256 fee = (_amount * PROTOCOL_FEE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR;
        uint256 netAmount = _amount - fee;

        // Transfer tokens
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(_token).safeTransfer(treasury, fee);

        // Create remittance
        uint256 remittanceId = remittanceCounter++;
        remittances[remittanceId] = Remittance({
            sender: msg.sender,
            phoneHash: _phoneHash,
            token: _token,
            amount: _amount,
            fee: fee,
            netAmount: netAmount,
            timestamp: block.timestamp,
            isClaimed: false,
            ensSubdomain: _ensSubdomain
        });

        emit RemittanceSent(remittanceId, msg.sender, _phoneHash, _token, _amount, fee, _ensSubdomain);
    }

    function claimRemittance(
        uint256 _remittanceId,
        address _recipient,
        bytes calldata _signature
    ) external nonReentrant whenNotPaused {
        require(merchants[msg.sender], "Not a merchant");
        require(_recipient != address(0), "Invalid recipient");

        Remittance storage remittance = remittances[_remittanceId];
        require(!remittance.isClaimed, "Already claimed");
        require(phoneToAddress[remittance.phoneHash] == _recipient, "Phone not registered");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encodePacked(_remittanceId, msg.sender, _recipient))
        ));
        require(messageHash.recover(_signature) == _recipient, "Invalid signature");

        // Mark as claimed and transfer
        remittance.isClaimed = true;
        IERC20(remittance.token).safeTransfer(msg.sender, remittance.netAmount);

        emit RemittanceClaimed(_remittanceId, _recipient, msg.sender, remittance.netAmount);
    }

    function getRemittance(uint256 _remittanceId) external view returns (Remittance memory) {
        return remittances[_remittanceId];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
