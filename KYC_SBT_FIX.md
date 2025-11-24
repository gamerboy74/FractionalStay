# KYC Approval & SBT Database Update Fix

## Issue Identified
KYC was being approved on-chain (proof submitted, SBT minted), but the frontend still showed "PENDING" status and SBT data wasn't being saved to the database.

## Root Causes

### 1. Missing Database Column
- **Problem**: `sbt_tx_hash` column didn't exist in the `users` table
- **Impact**: Database update would silently fail or ignore the SBT transaction hash
- **Fix**: Added migration `migration-add-sbt-tx-hash.sql`

### 2. Frontend Not Refreshing
- **Problem**: After approval, frontend only updated local state, didn't refetch from database
- **Impact**: UI showed stale data, didn't reflect actual database state
- **Fix**: Force refetch from `/api/admin/kyc/list` after approval

### 3. No Verification of Database Update
- **Problem**: API didn't verify the database update actually succeeded
- **Impact**: Silent failures when database update didn't work
- **Fix**: Added `.select()` to update query and verified returned data

## Fixes Applied

### Fix 1: Add Missing Database Column

**File**: `supabase/migration-add-sbt-tx-hash.sql` (NEW)

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sbt_tx_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_users_sbt_tx_hash ON users(sbt_tx_hash);
```

**Action Required**: Run this migration in Supabase SQL Editor:
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste contents of migration-add-sbt-tx-hash.sql
4. Execute
```

---

### Fix 2: Force Refetch After Approval

**File**: `frontend/components/admin/KYCManagementContent.tsx`

**Before**:
```typescript
if (response.ok) {
  // Only updated local state
  setKycDocuments(prev => prev.map(d => 
    d.id === doc.id ? { ...d, status: 'APPROVED', ... } : d
  ))
}
```

**After**:
```typescript
if (response.ok) {
  // Force refetch from database
  const refreshResponse = await fetch('/api/admin/kyc/list')
  if (refreshResponse.ok) {
    const refreshData = await refreshResponse.json()
    setKycDocuments(refreshData.documents || [])
  }
}
```

**Benefit**: UI now reflects actual database state, including SBT data

---

### Fix 3: Verify Database Update

**File**: `frontend/app/api/admin/kyc/approve/route.ts`

**Before**:
```typescript
const { error: userUpdateError } = await supabaseAdmin
  .from("users")
  .update({ ... })
  .eq("wallet_address", normalizedAddress);
```

**After**:
```typescript
const { data: updatedUser, error: userUpdateError } = await supabaseAdmin
  .from("users")
  .update({ 
    kyc_status: "APPROVED",
    proof_hash: proofHash,
    proof_tx_hash: proofTxHash,
    sbt_token_id: Number(sbtTokenId),
    sbt_metadata_cid: metadataCID,
    sbt_tx_hash: sbtTxHash,  // ← Now saved!
    verified_at: verifiedAtTimestamp,
  })
  .eq("wallet_address", normalizedAddress)
  .select();  // ← Verify update

// Verify the update succeeded
if (!updatedUser || updatedUser.length === 0) {
  return NextResponse.json({
    error: "Failed to verify user data update"
  }, { status: 500 });
}
```

**Benefit**: Catches database update failures immediately

---

### Fix 4: Improved Error Messages

**File**: `frontend/components/admin/KYCManagementContent.tsx`

**Before**:
```typescript
alert('❌ Failed to approve: ' + data.error)
```

**After**:
```typescript
alert(`❌ Failed to approve KYC:

${errorMsg}

Please check:
1. Relayer has sufficient gas
2. Contracts are deployed
3. Check browser console for details`)
console.error('KYC Approval Error:', data)
```

**Benefit**: Better debugging information for admins

---

## Testing Steps

### 1. Run Database Migration
```bash
# In Supabase SQL Editor, run:
supabase/migration-add-sbt-tx-hash.sql
```

**Expected**: Success message "Migration completed: sbt_tx_hash column added to users table"

---

### 2. Verify Column Exists
```sql
-- In Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'sbt%';
```

**Expected Output**:
```
column_name       | data_type
------------------|-----------
sbt_token_id      | bigint
sbt_metadata_cid  | text
sbt_tx_hash       | text
```

---

### 3. Test KYC Approval Flow

1. **Navigate to Admin Dashboard**
   ```
   http://localhost:3000/admin/login
   ```

2. **Connect Admin Wallet**
   - Must have admin role in UserRegistry contract

3. **Go to KYC Approvals**
   ```
   http://localhost:3000/admin/kyc
   ```

4. **Approve a Pending KYC**
   - Click "Approve" on any pending KYC
   - Wait for transactions to complete

5. **Verify Success Message**
   ```
   ✅ KYC Approved successfully!

   Proof Hash: 0x1234...
   Proof TX: 0xabcd...
   View: https://sepolia.arbiscan.io/tx/0xabcd...

   SBT Token ID: #1
   SBT TX: 0xef12...
   View: https://sepolia.arbiscan.io/tx/0xef12...

   View Explorer: /explorer/0x...
   ```

6. **Check UI Updates**
   - Status badge should change to "APPROVED" (green)
   - Card should move to "Approved" filter tab
   - No page refresh needed

7. **Verify Database**
   ```sql
   -- In Supabase SQL Editor
   SELECT 
     wallet_address,
     kyc_status,
     proof_hash,
     proof_tx_hash,
     sbt_token_id,
     sbt_tx_hash,
     verified_at
   FROM users
   WHERE kyc_status = 'APPROVED'
   ORDER BY verified_at DESC
   LIMIT 1;
   ```

   **Expected**: All fields populated with data

8. **Verify On-Chain**
   - Visit Arbiscan: `https://sepolia.arbiscan.io/tx/[sbt_tx_hash]`
   - Should see successful "Mint SBT" transaction
   - Check IdentitySBT contract for token

---

## Rollback (If Needed)

If issues arise, you can rollback:

### Remove Database Column
```sql
ALTER TABLE users DROP COLUMN IF EXISTS sbt_tx_hash;
```

### Revert Frontend Changes
```bash
git checkout HEAD -- frontend/components/admin/KYCManagementContent.tsx
git checkout HEAD -- frontend/app/api/admin/kyc/approve/route.ts
```

---

## Monitoring

### Check for Errors
```typescript
// Browser Console (F12)
// Look for errors like:
- "Failed to update user data"
- "Database update did not return expected data"
- Network errors (red in Network tab)
```

### Verify Transaction Success
```typescript
// Check Arbiscan for:
1. ZKRegistry.submitProof() - Proof submission
2. IdentitySBT.mintSBT() - SBT minting
3. UserRegistry.approveKYC() - On-chain KYC status
```

### Database Verification
```sql
-- Count approved users with complete SBT data
SELECT COUNT(*) as complete_approvals
FROM users
WHERE kyc_status = 'APPROVED'
  AND proof_hash IS NOT NULL
  AND sbt_token_id IS NOT NULL
  AND sbt_tx_hash IS NOT NULL;
```

---

## Common Issues & Solutions

### Issue 1: "Column 'sbt_tx_hash' does not exist"
**Cause**: Migration not run
**Solution**: Run `migration-add-sbt-tx-hash.sql` in Supabase

### Issue 2: Status still shows PENDING after approval
**Cause**: Browser cache or no network refetch
**Solution**: Hard refresh (Ctrl+Shift+R), check Network tab for refetch

### Issue 3: "Failed to update user data"
**Cause**: Supabase permissions or row-level security
**Solution**: Check Supabase RLS policies, ensure service role key is correct

### Issue 4: SBT minting fails
**Cause**: Relayer wallet has insufficient gas
**Solution**: Fund relayer wallet with Sepolia ETH

### Issue 5: Transaction pending forever
**Cause**: Network congestion or RPC issues
**Solution**: Check Arbiscan for transaction status, may need to increase gas

---

## Success Criteria

✅ Database migration runs without errors  
✅ KYC approval completes with proof + SBT transactions  
✅ UI updates to show "APPROVED" status immediately  
✅ Database has all fields populated (proof_hash, sbt_token_id, sbt_tx_hash)  
✅ Explorer page shows SBT token data  
✅ Arbiscan shows successful transactions  
✅ No errors in browser console  

---

## Files Modified

1. `supabase/migration-add-sbt-tx-hash.sql` - NEW (database migration)
2. `frontend/components/admin/KYCManagementContent.tsx` - Force refetch, better errors
3. `frontend/app/api/admin/kyc/approve/route.ts` - Verify DB updates, save sbt_tx_hash

**Total Changes**: 3 files (1 new, 2 modified)
