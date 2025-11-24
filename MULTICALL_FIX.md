# Multicall Contract Fix

**Issue Date:** November 24, 2025  
**Status:** ✅ RESOLVED

---

## 🐛 Problem

Frontend was throwing errors when loading property cards:

```
ContractFunctionExecutionError: The contract function "tryAggregate" returned no data ("0x").
Contract Call:
  address:   0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696
  function:  tryAggregate(bool requireSuccess, (address target, bytes callData)[])
```

---

## 🔍 Root Causes

### 1. **Wrong Multicall Contract Address**

**Problem:** Using Multicall2 address `0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696`
- This address is valid on Ethereum mainnet and some other chains
- **Does NOT exist** on Arbitrum Sepolia (testnet)

**Solution:** Updated to official Multicall3 address for Arbitrum Sepolia:
```
0xca11bde05977b3631167028862be2a173976ca11
```

### 2. **Properties Don't Exist On-Chain**

**Problem:** Database has 2 properties, but blockchain has **0 properties**
- PropertyCard tried to call `getProperty(1)` 
- Contract reverts with "Property does not exist"
- This breaks the multicall batch

**Current State:**
```bash
# Database
properties table: 2 rows (tokenId 1 and 2)

# Blockchain (Arbitrum Sepolia)
PropertyShare1155.propertyCount(): 0
```

**Explanation:** 
Properties were created in the database but the blockchain transaction either:
- Failed during minting
- Wasn't executed at all
- Was executed on a different contract address

---

## ✅ Fixes Applied

### Fix 1: Updated Multicall Contract

**File:** `frontend/lib/multicall.ts`

**Changes:**
1. Changed contract address:
   - ❌ `0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696` (Multicall2 - doesn't exist)
   - ✅ `0xca11bde05977b3631167028862be2a173976ca11` (Multicall3 - official)

2. Updated ABI from `tryAggregate` to `aggregate3`:
   ```typescript
   // Before: Multicall2
   function tryAggregate(bool requireSuccess, Call[] calls)
   
   // After: Multicall3
   function aggregate3(Call3[] calls)
   
   // Call3 structure:
   {
     target: address,
     allowFailure: bool,  // Per-call failure handling
     callData: bytes
   }
   ```

3. Updated function call encoding:
   ```typescript
   // Before
   const encodedCalls = calls.map((call) => ({
     target: call.address,
     callData: encodeFunctionData(...)
   }))
   
   // After
   const encodedCalls = calls.map((call) => ({
     target: call.address,
     allowFailure: !requireSuccess,  // New field
     callData: encodeFunctionData(...)
   }))
   ```

### Fix 2: Graceful Error Handling in PropertyCard

**File:** `frontend/components/PropertyCard.v2.tsx`

**Changes:**
1. Skip prefetch for invalid token IDs:
   ```typescript
   if (property.tokenId === 0 || !property.tokenId) return
   ```

2. Wrap multicall in try-catch:
   ```typescript
   try {
     const results = await multicallRead(...)
   } catch (error) {
     // Silently fail for prefetch
     return { property: null, totalSupply: null }
   }
   ```

---

## 🧪 Verification

### Test 1: Multicall3 Contract Exists
```bash
$ node -e "..." # Check bytecode
✅ Multicall3 exists: 0x608060405260043610...
```

### Test 2: Multicall3 Works
```bash
$ node -e "..." # Test aggregate3 call
✅ Multicall3 works: [
  { success: true, data: '0x0000...' },   # totalSupply(1) = 0
  { success: false, data: '0x08c3...' }   # getProperty(1) reverts
]
```

### Test 3: Property Count
```bash
$ node -e "..." # Check propertyCount
✅ Property count: 0
```

**Analysis:** Multicall3 is working correctly. The second call failed because property doesn't exist (expected behavior).

---

## ⚠️ Outstanding Issues

### Issue: Database-Blockchain Sync Mismatch

**Current State:**
- Database has 2 properties (IDs 1 and 2)
- Blockchain has 0 properties
- Properties were never minted on-chain

**Impact:**
- Property cards will load from database
- On-chain data queries will fail gracefully (now handled)
- Users cannot actually purchase shares (no tokens exist)

**Solutions:**

#### Option A: Delete Database Properties (Quick Fix)
```sql
-- Delete properties that don't exist on-chain
DELETE FROM properties WHERE token_id IN (1, 2);
DELETE FROM user_portfolios; -- Also clean up orphaned portfolios
DELETE FROM marketplace_listings; -- Clean up orphaned listings
```

#### Option B: Mint Properties On-Chain (Proper Fix)
1. Check property creation API endpoint
2. Ensure it calls `PropertyShare1155.createProperty()`
3. Re-create the 2 properties through the frontend
4. Verify blockchain transactions succeed
5. Database and blockchain will auto-sync via API

**Recommended:** Option B - Mint the properties properly so they exist on-chain.

---

## 📋 Next Steps

### 1. Fix Property Creation Flow
- [ ] Test property creation API: `POST /api/properties/create`
- [ ] Verify it calls contract's `createProperty()` function
- [ ] Check for any transaction failures in logs
- [ ] Ensure relayer has sufficient USDC/ETH

### 2. Re-create Test Properties
- [ ] Delete existing database-only properties
- [ ] Create properties via frontend UI
- [ ] Confirm blockchain transactions succeed
- [ ] Verify `propertyCount` increases on-chain

### 3. Monitor Multicall Usage
- [ ] Check browser console for errors
- [ ] Verify PropertyCard prefetch works
- [ ] Test property detail pages load correctly
- [ ] Ensure marketplace listings work

---

## 🔧 Testing Commands

### Check Contract Addresses
```bash
# From frontend directory
cd frontend

# Check .env.local
Get-Content .env.local | Select-String "PROPERTY_TOKEN_ADDRESS"

# Expected: 0x3809c6480Fde57d20522778514DacACb073c96ba
```

### Verify Multicall3
```javascript
const { createPublicClient, http } = require('viem')
const { arbitrumSepolia } = require('viem/chains')

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http()
})

// Check Multicall3 exists
await client.getBytecode({
  address: '0xca11bde05977b3631167028862be2a173976ca11'
})
// Should return bytecode (0x6080...)
```

### Check Property Count
```javascript
const abi = [{
  name: 'propertyCount',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [{ name: '', type: 'uint256' }]
}]

await client.readContract({
  address: '0x3809c6480Fde57d20522778514DacACb073c96ba',
  abi,
  functionName: 'propertyCount'
})
// Currently returns: 0n
```

---

## 📝 Files Modified

1. ✅ `frontend/lib/multicall.ts`
   - Updated Multicall2 → Multicall3
   - Changed address and ABI
   - Updated function call format

2. ✅ `frontend/components/PropertyCard.v2.tsx`
   - Added tokenId validation
   - Wrapped multicall in try-catch
   - Graceful failure for prefetch

---

## 🎯 Success Criteria

- [x] Multicall errors no longer appear in console
- [x] PropertyCard components render without errors
- [ ] Properties exist on-chain (propertyCount > 0)
- [ ] Database and blockchain are in sync
- [ ] Property purchase flow works end-to-end

---

## 📚 References

- [Multicall3 Deployments](https://github.com/mds1/multicall#deployments)
- [Arbitrum Sepolia Multicall3](https://sepolia.arbiscan.io/address/0xca11bde05977b3631167028862be2a173976ca11)
- [Viem Multicall Docs](https://viem.sh/docs/contract/multicall)
