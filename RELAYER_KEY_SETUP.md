# Relayer Private Key Setup

## What is Relayer Private Key?

The relayer private key is a wallet private key used by the relayer service to:

- Deposit rent (USDC) to the RevenueSplitter contract
- Pay for gas fees
- Sign transactions automatically

## Where to Get Relayer Private Key?

### Option 1: Use Existing Wallet (If you have one)

If you already have a wallet with testnet ETH and USDC:

1. Export private key from MetaMask or your wallet
2. Use that private key

**⚠️ Security Warning:** Never use your main wallet's private key. Create a separate wallet for relayer.

### Option 2: Create New Wallet (Recommended)

#### Method A: Using MetaMask

1. Open MetaMask
2. Click account icon → "Create Account" or "Add Account"
3. Name it "Relayer" or "FractionalStay Relayer"
4. Click on the account → "Account Details"
5. Click "Show Private Key"
6. Enter password
7. Copy the private key (without 0x prefix)

#### Method B: Using Script (Quick)

Create a new wallet programmatically:

```bash
# Using Node.js
node -e "const { ethers } = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

#### Method C: Using Online Generator (Not Recommended)

- Use only for testnet
- https://vanity-eth.tk/ (testnet only!)
- Generate and copy private key

## Important: Fund the Relayer Wallet

After getting the private key, you need to:

1. **Send Arbitrum Sepolia ETH** to the relayer wallet address

   - For gas fees
   - Get from faucet: https://faucet.quicknode.com/arbitrum/sepolia

2. **Send USDC** to the relayer wallet address
   - For rent deposits
   - Get testnet USDC from faucet or bridge

## How to Add to .env

Add to `relayer-service/.env`:

```env
PRIVATE_KEY=your_private_key_without_0x_prefix
```

**Important:**

- ✅ Remove `0x` prefix if present
- ✅ Keep it secret (never commit to git)
- ✅ Use only for testnet (never mainnet)

## Example

If your private key is: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

In `.env` file, use:

```env
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Security Best Practices

1. ✅ Create separate wallet for relayer
2. ✅ Use only testnet for development
3. ✅ Never commit private key to git
4. ✅ Use environment variables only
5. ✅ Keep `.env` in `.gitignore` (already done)

## Quick Setup Checklist

- [ ] Create new wallet (MetaMask or script)
- [ ] Copy private key (without 0x)
- [ ] Fund wallet with testnet ETH
- [ ] Fund wallet with testnet USDC
- [ ] Add to `relayer-service/.env`
- [ ] Test relayer: `npm start 1 1000`

## Testing the Relayer

After setup, test with:

```bash
cd relayer-service
npm start 1 1000  # Property 1, 1000 USDC
```

This will:

1. Check wallet balance
2. Approve USDC
3. Deposit rent to RevenueSplitter





