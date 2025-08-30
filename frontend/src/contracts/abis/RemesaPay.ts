export const RemesaPayABI = [
  {
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_feeRecipient", "type": "address"},
      {"name": "_platformFeeRate", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "merchantAddress", "type": "address"},
      {"indexed": false, "name": "businessName", "type": "string"},
      {"indexed": false, "name": "businessType", "type": "string"}
    ],
    "name": "MerchantRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "customer", "type": "address"},
      {"indexed": true, "name": "merchant", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "fee", "type": "uint256"}
    ],
    "name": "MerchantPaymentProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "previousOwner", "type": "address"},
      {"indexed": true, "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "bytes32"},
      {"indexed": true, "name": "recipient", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "RemittanceClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "bytes32"},
      {"indexed": true, "name": "sender", "type": "address"},
      {"indexed": true, "name": "recipient", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "fee", "type": "uint256"},
      {"indexed": false, "name": "recipientPhoneHash", "type": "bytes32"}
    ],
    "name": "RemittanceSent",
    "type": "event"
  },
  {
    "inputs": [
      {"name": "amount", "type": "uint256"}
    ],
    "name": "calculateFees",
    "outputs": [
      {"name": "platformFee", "type": "uint256"},
      {"name": "gasFee", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "recipientPhoneHash", "type": "bytes32"}
    ],
    "name": "claimRemittance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeRecipient",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "phoneHash", "type": "bytes32"}
    ],
    "name": "getPendingClaims",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "bytes32"},
          {"name": "sender", "type": "address"},
          {"name": "recipient", "type": "address"},
          {"name": "amount", "type": "uint256"},
          {"name": "fee", "type": "uint256"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "claimed", "type": "bool"},
          {"name": "recipientPhoneHash", "type": "bytes32"}
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "user", "type": "address"}
    ],
    "name": "getUserRemittances",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "bytes32"},
          {"name": "sender", "type": "address"},
          {"name": "recipient", "type": "address"},
          {"name": "amount", "type": "uint256"},
          {"name": "fee", "type": "uint256"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "claimed", "type": "bool"},
          {"name": "recipientPhoneHash", "type": "bytes32"}
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "", "type": "address"}
    ],
    "name": "merchants",
    "outputs": [
      {"name": "businessName", "type": "string"},
      {"name": "businessType", "type": "string"},
      {"name": "isActive", "type": "bool"},
      {"name": "totalVolume", "type": "uint256"},
      {"name": "registrationTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeeRate",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "merchant", "type": "address"}
    ],
    "name": "processMerchantPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "businessName", "type": "string"},
      {"name": "businessType", "type": "string"}
    ],
    "name": "registerMerchant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "", "type": "bytes32"}
    ],
    "name": "remittances",
    "outputs": [
      {"name": "id", "type": "bytes32"},
      {"name": "sender", "type": "address"},
      {"name": "recipient", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "fee", "type": "uint256"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "claimed", "type": "bool"},
      {"name": "recipientPhoneHash", "type": "bytes32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "recipient", "type": "address"},
      {"name": "recipientPhoneHash", "type": "bytes32"}
    ],
    "name": "sendRemittance",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_feeRecipient", "type": "address"}
    ],
    "name": "setFeeRecipient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_platformFeeRate", "type": "uint256"}
    ],
    "name": "setPlatformFeeRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "newOwner", "type": "address"}
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
