# Gas Fee Issue Fix - 2000 ETH Estimate

## Problem

After USDC approval, when attempting to purchase property shares, MetaMask shows an extremely high gas estimate (2000 ETH). This prevents users from completing purchases.

## Root Cause

After redeploying contracts, the new `PropertyShare1155` contract has **no properties** on-chain. When users try to purchase shares using a `tokenId` from the database:

1. The database has properties with tokenIds (e.g., tokenId 1, 2, 3)
2. The new contract has **zero properties** (propertyCount = 0)
3. Calling `purchaseShares(tokenId)` with a non-existent tokenId causes the contract to revert
4. When a transaction will revert, MetaMask shows an extremely high gas estimate (2000 ETH) because it can't properly estimate gas for a failing transaction

### Contract Code
```solidity
function purchaseShares(uint256 tokenId, uint256 amount) external {
    require(properties[tokenId].exists, "Property does not exist"); // ❌ This fails
    // ... rest of function
}
```

## Solution

Added **on-chain property existence checks** before allowing purchase:

### 1. Updated `BuySharesForm.tsx`
- Added `getProperty` contract call to verify property exists on-chain
- Disabled purchase button if property doesn't exist
- Added clear error message explaining the issue
- Added validation in `handleBuy` to prevent transaction submission

### 2. Updated `InvestmentDialog.tsx`
- Added same `getProperty` check
- Added validation in both `handleContinue` and `handlePurchase`
- Added UI warning when property doesn't exist
- Disabled continue button if property doesn't exist

## Changes Made

### BuySharesForm.tsx
```typescript
// Before: Only checked propertyCount
const { data: propertyCount } = useReadContract({
  functionName: 'propertyCount',
})
const propertyExists = propertyCount ? BigInt(tokenId) <= propertyCount : false

// After: Checks actual property existence
const { data: propertyData } = useReadContract({
  functionName: 'getProperty',
  args: [BigInt(tokenId)],
})
const propertyExists = propertyData?.exists === true
```

### InvestmentDialog.tsx
- Added `getProperty` to ABI
- Added property existence check
- Added validation before purchase
- Added UI warning message

## Result

✅ **Before Purchase:**
- Component checks if property exists on-chain
- Shows clear error message if property doesn't exist
- Prevents transaction submission (no more 2000 ETH gas estimate)

✅ **User Experience:**
- Clear error message: "Property does not exist on blockchain"
- Explains it's likely due to contract redeployment
- Suggests creating a new property

## Next Steps for Users

1. **Create New Properties**: Since contracts were redeployed, create new properties using the new contract address
2. **Old Properties**: Properties created before redeployment won't work with the new contract
3. **Database Cleanup**: Consider cleaning up old properties from database that don't exist on-chain

## Testing

To test the fix:
1. Try to purchase shares from a property that doesn't exist on-chain
2. Should see error message instead of 2000 ETH gas estimate
3. Create a new property and verify purchase works correctly

## Technical Details

**Why 2000 ETH gas estimate?**
- When a transaction will revert, MetaMask can't estimate gas properly
- It returns a very high number as a safety measure
- This is a common pattern when calling non-existent functions or invalid parameters

**The Fix:**
- We now check `getProperty(tokenId).exists` before attempting purchase
- If `exists === false`, we block the transaction client-side
- This prevents the revert and the high gas estimate

