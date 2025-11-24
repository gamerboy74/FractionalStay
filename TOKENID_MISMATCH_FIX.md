# TokenId Mismatch Problem & Solution

## समस्या क्या है? (What's the Problem?)

**Database में wrong tokenId store ho raha hai!**

### Real Scenario:
```
Blockchain पर:
- Property tokenId: 1
- Name: "Conan Cole"
- Seller: 0x8e1E7F06c9d62EDeB55ff9D9C45D3D8D97A905A6

Database में:
- token_id: 1763840475319 ❌ (timestamp, not real tokenId!)
- Name: "Conan Cole"
- Seller: 0x8e1E7F06c9d62EDeB55ff9D9C45D3D8D97A905A6
```

### Problem का असर:
1. ❌ User property page खोलता है → tokenId 1763840475319 use होता है
2. ❌ Frontend blockchain से data fetch करने की कोशिश करता है
3. ❌ Contract कहता है: "Property does not exist" (क्योंकि tokenId 1 है, 1763840475319 नहीं!)
4. ❌ MetaMask insane gas fee दिखाता है ($200,000+ ETH) क्योंकि transaction fail होगी

## Root Cause:

### Property Creation Flow:
```typescript
// Step 1: Seller creates property on blockchain ✅
writeContract({ createProperty(...) })

// Step 2: Transaction confirms ✅
receipt = await waitForTransaction()

// Step 3: Extract tokenId from event logs
tokenId = extractTokenIdFromReceipt(receipt)

// Step 4: Save to database
// ❌ PROBLEM: Agar event extraction fail hua toh fallback use karta hai:
if (!tokenId) {
  tokenId = Date.now() // ❌ Timestamp (1763840475319)
}
```

### Why Event Extraction Fails:
1. RPC provider log data return nahi karta properly
2. Transaction confirmation bahut jaldi ho gaya, logs ready nahi the
3. Network issue ya rate limiting
4. ABI decoding issue (rare)

## Solution 1: Database Update (Immediate Fix)

### Option A: SQL Query (Recommended)
Supabase SQL Editor में run karein:

```sql
-- Find properties with wrong tokenIds (timestamps)
SELECT token_id, name, seller_wallet 
FROM properties 
WHERE LENGTH(token_id) > 10;

-- Update with correct tokenId
UPDATE properties
SET token_id = '1'
WHERE LOWER(seller_wallet) = LOWER('0x8e1E7F06c9d62EDeB55ff9D9C45D3D8D97A905A6')
  AND name LIKE '%Conan Cole%';
```

### Option B: Manual Update (Simple)
1. Supabase Dashboard → Table Editor → `properties`
2. Find row with `token_id = 1763840475319`
3. Edit → Change to `token_id = 1`
4. Save

## Solution 2: Code Fix (Prevent Future Issues)

### A. Better Event Extraction with Retry

File: `frontend/lib/contract-events.ts`

```typescript
export async function extractTokenIdWithRetry(
  txHash: string,
  publicClient: any,
  maxRetries = 3
): Promise<bigint | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Wait a bit for logs to be indexed
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
      
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash })
      const tokenId = extractTokenIdFromReceipt(receipt)
      
      if (tokenId) {
        logger.info('✅ TokenId extracted', { tokenId: tokenId.toString(), attempt })
        return tokenId
      }
      
      logger.warn('⚠️ No tokenId in logs, retrying...', { attempt })
    } catch (error) {
      logger.error('❌ Extraction attempt failed', { attempt, error })
    }
  }
  
  return null
}
```

### B. Alternative: Read propertyCount from Contract

```typescript
// After transaction confirms, get latest tokenId from contract
const propertyCount = await PropertyShare1155.propertyCount()
const latestTokenId = propertyCount.toString() // Last created property
```

### C. Validate TokenId Before Database Save

```typescript
async function validateAndSaveProperty(tokenId: string) {
  // Verify tokenId exists on blockchain before saving
  try {
    const property = await PropertyShare1155.getProperty(tokenId)
    if (!property.exists) {
      throw new Error(`TokenId ${tokenId} does not exist on-chain!`)
    }
    
    // Now safe to save
    await saveToDatabase(tokenId)
  } catch (error) {
    logger.error('TokenId validation failed', { tokenId, error })
    throw error
  }
}
```

## Solution 3: Diagnostic Script

Run this script to find and fix all mismatches:

```powershell
cd C:\Users\gboy3\OneDrive\Documents\FractionalEstate\contracts
npx hardhat run scripts/sync-db-properties.ts --network arbitrumSepolia
```

This will:
1. ✅ Fetch all properties from blockchain
2. ✅ Show correct tokenIds
3. ✅ Generate SQL UPDATE queries
4. ✅ You can copy-paste into Supabase

## How to Test After Fix:

### Step 1: Update Database
```sql
UPDATE properties SET token_id = '1' WHERE token_id = '1763840475319';
```

### Step 2: Check Property Details
```powershell
cd contracts
$env:TOKEN_ID="1"; npx hardhat run scripts/check-property.ts --network arbitrumSepolia
```

Expected output:
```
✅ Property Details:
Exists: true
Seller: 0x8e1E7F06c9d62EDeB55ff9D9C45D3D8D97A905A6
Price per Share: 750.0 USDC
Total Shares: 3
```

### Step 3: Test Purchase in Frontend
1. Navigate to property page with tokenId 1
2. Try to buy shares
3. MetaMask should show normal gas (~$0.005, not $200,000!)

### Step 4: Test Gas Estimate
```powershell
$env:TOKEN_ID="1"; $env:SHARES="1"; npx hardhat run scripts/test-purchase.ts --network arbitrumSepolia
```

Expected output:
```
Estimated gas cost: 0.00000239112 ETH (≈$ 0.0048 USD at $2000/ETH)
✅ Gas estimate looks normal!
```

## Prevention: Best Practices

### 1. Always Validate TokenId
```typescript
if (tokenId && tokenId.length < 10 && !isNaN(Number(tokenId))) {
  // Valid tokenId (small number)
  await saveToDatabase(tokenId)
} else {
  // Invalid tokenId - don't save!
  throw new Error('Failed to get valid tokenId from blockchain')
}
```

### 2. Show User Clear Message
```typescript
if (!tokenIdExtracted) {
  alert('⚠️ Property created on blockchain but tokenId extraction failed. Please contact support with transaction hash: ' + txHash)
}
```

### 3. Background Sync Job
Create a cron job that:
1. Reads all properties from database
2. Checks if tokenId exists on-chain
3. If not, marks as "needs_sync"
4. Admin can manually fix

## Quick Commands

```powershell
# List all on-chain properties
npx hardhat run scripts/list-properties.ts --network arbitrumSepolia

# Check specific tokenId
$env:TOKEN_ID="1"; npx hardhat run scripts/check-property.ts --network arbitrumSepolia

# Sync database with blockchain
npx hardhat run scripts/sync-db-properties.ts --network arbitrumSepolia

# Test purchase flow
$env:TOKEN_ID="1"; $env:SHARES="1"; npx hardhat run scripts/test-purchase.ts --network arbitrumSepolia
```

## Summary

**Current State:**
- ✅ Blockchain: Property tokenId = `1`
- ❌ Database: token_id = `1763840475319` (timestamp fallback)
- ❌ Result: Frontend tries to buy non-existent property → insane gas fees

**Fix:**
1. Update database: `UPDATE properties SET token_id = '1'`
2. Improve event extraction with retry logic
3. Add validation before database save
4. Use sync script to detect future mismatches

**After Fix:**
- ✅ Database: token_id = `1`
- ✅ Frontend: Correctly loads property from blockchain
- ✅ Purchase: Normal gas fees (~$0.005)
- ✅ Happy users! 🎉
