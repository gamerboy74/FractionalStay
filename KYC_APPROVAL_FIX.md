# KYC Approval Database Sync Fix

## Problem
KYC was approved on-chain (proof submitted, SBT minted) but:
1. Frontend UI still showed "PENDING" status
2. SBT data wasn't visible in KYC documents table

## Root Cause
The API was updating **users** table with SBT data, but NOT updating **kyc_documents** table with the ZK proof and SBT transaction details.

## Database Structure

### KYC_DOCUMENTS Table Columns:
```
- zk_proof_hash         (for ZK proof hash)
- zk_proof_tx_hash      (for proof submission tx)
- sbt_token_id          (for SBT token ID)
- sbt_mint_tx_hash      (for SBT minting tx)
- sbt_metadata_cid      (for IPFS metadata)
- status                (PENDING/APPROVED/REJECTED)
```

### USERS Table Columns:
```
- proof_hash
- proof_tx_hash
- sbt_token_id
- sbt_metadata_cid
- verified_at
```

## Fix Applied

Updated `frontend/app/api/admin/kyc/approve/route.ts` to properly update **kyc_documents** table:

**Before:**
```typescript
// Only updated status
.update({
  status: "APPROVED",
  reviewed_at: verifiedAtTimestamp,
  reviewed_by: adminAddress,
})
```

**After:**
```typescript
// Now updates ALL SBT fields
.update({
  status: "APPROVED",
  reviewed_at: verifiedAtTimestamp,
  reviewed_by: adminAddress,
  zk_proof_hash: proofHash,           // ✅ Added
  zk_proof_tx_hash: proofTxHash,      // ✅ Added
  sbt_token_id: Number(sbtTokenId),   // ✅ Added
  sbt_mint_tx_hash: sbtTxHash,        // ✅ Added
  sbt_metadata_cid: metadataCID,      // ✅ Added
})
```

## Additional Fixes

1. **Force Refetch** - Frontend now refetches KYC list after approval
2. **Dual Field Check** - Query checks both `user_wallet` and `wallet_address`
3. **Better Logging** - Added verification logs for debugging

## Testing

1. Go to `/admin/kyc`
2. Approve a pending KYC
3. Check status changes to "APPROVED" immediately
4. Verify in database:
   ```sql
   SELECT 
     wallet_address,
     status,
     zk_proof_hash,
     zk_proof_tx_hash,
     sbt_token_id,
     sbt_mint_tx_hash
   FROM kyc_documents
   WHERE status = 'APPROVED'
   ORDER BY reviewed_at DESC
   LIMIT 1;
   ```

## Files Modified
- `frontend/app/api/admin/kyc/approve/route.ts` - Update kyc_documents with SBT data
- `frontend/components/admin/KYCManagementContent.tsx` - Force refetch after approval
