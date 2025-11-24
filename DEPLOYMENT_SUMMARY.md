# Contract Redeployment Summary

## ✅ Successfully Redeployed Contracts

**Date:** November 24, 2025  
**Network:** Arbitrum Sepolia  
**Deployer:** 0x9643646d5D31d69ad3A47aE4E023f07333b2b746

### New Contract Addresses

| Contract | Old Address | New Address |
|----------|-------------|-------------|
| **PropertyShare1155** | `0x1585cF3fc80509920C8A4c9347d189329a6C21D6` | `0xd8fF4eD63C9679DF74Bb0D70dc69553d531F461f` |
| **RevenueSplitter** | `0x21dd5419Da6C7FE827F0ca7eAbb219c64f6E8033` | `0x36238C9dB66fB0f3b7BAC7b49098230C56FCb3B9` |
| **Marketplace** | `0x9679087b60Cf6f87E14342114B921707B099947d` | `0x9598601209047955c7131b7Fabd9bA0e491c82e2` |
| **Governance** | `0xfC2356302B61a53F22eD0297AB19D1F788c81C32` | `0x8601659C50B39e99cD7Cf215660454FaA2B0639f` |

### Preserved Contracts (NOT Redeployed)

| Contract | Address |
|----------|---------|
| **IdentitySBT** | `0x67905835BED0f5b633Ed8cA5B2e2506Cf2afF1F7` |
| **UserRegistry** | `0xf77951f62ED3B92d6c8db131aca2D7b822301Ee2` |
| **ZKRegistry** | `0x4c01b3A4724D85Bf5d4913D2bF40CEA27b59a7d7` |
| **USDC** | `0x87917eE5e87Ed830F3D26A14Df3549f6A6Aa332C` |

## 📝 Configuration Updates

### ✅ Updated Files

1. **`frontend/.env.local`**
   - Updated all core contract addresses
   - Preserved IdentitySBT, UserRegistry, ZKRegistry addresses

2. **`indexer/.env`**
   - Updated PropertyShare1155, RevenueSplitter, Marketplace addresses
   - Preserved UserRegistry, ZKRegistry, IdentitySBT addresses

3. **`contracts/deployments.json`**
   - Saved new deployment addresses
   - Contains only newly deployed contracts

4. **`contracts/.env`**
   - Added USDC_ADDRESS for future deployments

## 🚀 Next Steps

### 1. Update Indexer Start Block
The indexer needs to start from the block where new contracts were deployed. Update `indexer/.env`:

```bash
# Get the current block number from Arbiscan or your RPC
# Then update START_BLOCK in indexer/.env
START_BLOCK=<current_block_number>
```

### 2. Restart Services

**Frontend:**
```bash
cd frontend
npm run dev
# Or restart your production server
```

**Indexer:**
```bash
cd indexer
npm run build
npm start
```

### 3. Test Property Creation Flow

1. Create a new property through the frontend
2. Verify it appears in the admin panel
3. Check that token_id is correctly saved to database
4. Test property purchase flow
5. Test marketplace listing

### 4. Verify Database Sync

Check that the indexer is processing events from the new contracts:
- PropertyCreated events
- SharesPurchased events
- Marketplace listings

## ⚠️ Important Notes

1. **Old Properties:** Properties created with old contracts will not work with new contracts. You'll need to:
   - Create new properties using the new contracts
   - Or migrate existing properties (if needed)

2. **Database:** The database schema has been fixed to match actual structure. New properties should save correctly with proper `token_id` as INTEGER.

3. **Indexer:** The indexer will start indexing from the new contract addresses. Make sure to update `START_BLOCK` to the deployment block.

## 📊 Deployment Details

- **Gas Used:** ~0.05 ETH
- **Deployment Time:** ~2 minutes
- **Contracts Compiled:** 3 Solidity files
- **Network:** Arbitrum Sepolia (Chain ID: 421614)

## 🔍 Verification

To verify contracts on Arbiscan:
- PropertyShare1155: https://sepolia.arbiscan.io/address/0xd8fF4eD63C9679DF74Bb0D70dc69553d531F461f
- RevenueSplitter: https://sepolia.arbiscan.io/address/0x36238C9dB66fB0f3b7BAC7b49098230C56FCb3B9
- Marketplace: https://sepolia.arbiscan.io/address/0x9598601209047955c7131b7Fabd9bA0e491c82e2
- Governance: https://sepolia.arbiscan.io/address/0x8601659C50B39e99cD7Cf215660454FaA2B0639f

## ✅ Status

- ✅ Contracts deployed successfully
- ✅ Frontend configuration updated
- ✅ Indexer configuration updated
- ✅ Database schema fixed
- ⏳ Indexer START_BLOCK needs update
- ⏳ Services need restart
- ⏳ Testing required

