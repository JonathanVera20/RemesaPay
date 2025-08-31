# Deploy ETH Support to Base Sepolia

## Prerequisites
- You have 0.05 SepoliaETH in your wallet
- MetaMask is connected to Base Sepolia testnet

## Steps to Deploy

### 1. Get Your Private Key
1. Open MetaMask
2. Click the 3 dots menu next to your account
3. Select "Account Details"
4. Click "Export Private Key"
5. Enter your MetaMask password
6. Copy the private key (it should start with 0x)

### 2. Update Environment
1. Edit `contracts/.env`
2. Replace the `DEPLOYER_PRIVATE_KEY` with your private key (remove the 0x prefix)
   ```
   DEPLOYER_PRIVATE_KEY=your_actual_private_key_here_without_0x
   ```

### 3. Deploy Contract
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network baseTestnet
```

### 4. Update Frontend Configuration
After successful deployment, you'll get a contract address. Update `frontend/src/config/web3.ts`:

```typescript
[baseSepolia.id]: {
  remesaPay: '0xYOUR_DEPLOYED_CONTRACT_ADDRESS', // Replace with actual address
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  usdt: '0x0000000000000000000000000000000000000000',
},
```

## What's New - ETH Support

The updated contract now includes:

### New Functions
- `sendRemittanceETH()` - Send ETH directly without token approval
- Enhanced `claimRemittance()` - Handles both ETH and ERC20 tokens

### Frontend Changes
- ETH is now available in the currency selector
- No approval needed for ETH transactions
- Dynamic balance checking for selected currency
- Minimum amount: 0.001 ETH (vs $1 for stablecoins)

## Testing Your ETH Transaction

1. Go to http://localhost:3000/send
2. Connect your wallet (with 0.05 SepoliaETH)
3. Select "ETH" from the currency dropdown
4. Enter amount (minimum 0.001 ETH)
5. Enter recipient phone number
6. Click "Send" - no approval needed!

## Transaction Flow

1. **ETH Selected**: No token approval required
2. **Amount Validation**: Checks your actual ETH balance
3. **Transaction**: Calls `sendRemittanceETH()` with ETH value
4. **Contract**: Stores remittance with `address(0)` for ETH token
5. **Claiming**: Merchant can claim ETH directly to their wallet

## Gas Estimates
- ETH remittance: ~150,000 gas
- No approval transaction needed (saves ~50,000 gas)

Your 0.05 SepoliaETH is more than enough for multiple test transactions!
