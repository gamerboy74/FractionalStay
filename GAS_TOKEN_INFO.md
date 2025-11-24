# Gas Token for Contract Deployment

## Answer: **ETH (Native Token)**

For contract deployment on **Arbitrum Sepolia**, you need **ETH** (native token) to pay gas fees.

## Gas Token Breakdown

### For Deployment & Transactions:

- ✅ **ETH** - Used for all gas fees
  - Contract deployment
  - Function calls
  - Transactions
  - Gas fees

### For Application Logic:

- ✅ **USDC** - Used for:
  - Rent deposits (RevenueSplitter)
  - Property share purchases
  - Marketplace payments
  - Revenue distributions

## What You Need

### For Deploying Contracts:

1. **Arbitrum Sepolia ETH** in your deployer wallet
   - For gas fees (~0.001-0.01 ETH should be enough)
   - Get from faucet: https://faucet.quicknode.com/arbitrum/sepolia

### For Running the Application:

1. **Arbitrum Sepolia ETH** - For user transactions
2. **Arbitrum Sepolia USDC** - For buying shares, rent deposits

## Gas Fees Estimate

### Contract Deployment (Approximate):

- PropertyShare1155: ~0.001 ETH
- RevenueSplitter: ~0.001 ETH
- Marketplace: ~0.001 ETH
- Governance: ~0.001 ETH
- **Total: ~0.004-0.005 ETH** (very rough estimate)

### Regular Transactions:

- Property creation: ~0.0001 ETH
- Share purchase: ~0.0001 ETH
- Rent deposit: ~0.0001 ETH
- Claim rewards: ~0.0001 ETH

## How to Get Testnet ETH

### Arbitrum Sepolia ETH Faucets:

1. **QuickNode Faucet** (Recommended):

   - https://faucet.quicknode.com/arbitrum/sepolia
   - Connect wallet, request ETH

2. **Alchemy Faucet**:

   - https://www.alchemy.com/faucets/arbitrum-sepolia
   - Sign up, request ETH

3. **Chainlink Faucet**:
   - https://faucets.chain.link/arbitrum-sepolia
   - Connect wallet, request ETH

## Check Your Balance

The deploy script automatically checks your balance:

```bash
cd contracts
npm run deploy:sepolia
```

You'll see:

```
Deploying contracts with account: 0x...
Account balance: 1000000000000000000  # 1 ETH in wei
```

## Important Notes

1. ✅ **ETH is for gas** - Always needed for transactions
2. ✅ **USDC is for app** - Used for property shares and rent
3. ⚠️ **Testnet only** - These are test tokens, no real value
4. ⚠️ **Faucet limits** - May need to request multiple times
5. ⚠️ **Bridge if needed** - Can bridge from Sepolia mainnet if you have Sepolia ETH

## Summary

| Purpose         | Token | Where to Get                |
| --------------- | ----- | --------------------------- |
| Gas fees        | ETH   | Faucet (QuickNode, Alchemy) |
| Rent deposits   | USDC  | Bridge or faucet            |
| Share purchases | USDC  | Bridge or faucet            |

## Quick Checklist

Before deploying:

- [ ] Deployer wallet has Arbitrum Sepolia ETH
- [ ] At least 0.01 ETH recommended (for safety)
- [ ] RPC URL configured in `contracts/.env`
- [ ] Private key configured in `contracts/.env`





