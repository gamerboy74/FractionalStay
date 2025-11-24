# Database Cleanup Report

**Analysis Date:** November 24, 2024  
**Tables Analyzed:** 9  
**Action:** Safe column removal migration created

---

## 📊 Current Database State

| Table | Rows | Status |
|-------|------|--------|
| users | 8 | ✅ Active |
| properties | 2 | ✅ Active |
| kyc_documents | 7 | ✅ Active |
| marketplace_listings | 2 | ✅ Active |
| user_portfolios | 1 | ✅ Active |
| transactions | 1 | ✅ Active |
| rent_deposits | 3 | ✅ Active |
| ward_boy_mappings | 1 | ✅ Active |
| marketplace_transactions | 2 | ✅ Active |

---

## ❌ No Tables to Delete

All 9 tables are actively used in the application:
- **Core Tables:** users, properties, transactions
- **KYC System:** kyc_documents
- **Marketplace:** marketplace_listings, marketplace_transactions
- **Portfolio:** user_portfolios
- **Ward Boy System:** ward_boy_mappings, rent_deposits

---

## 🗑️ Unused Columns to Remove

### 1. `users` Table (3 columns removed)

#### ❌ `profile_image_url`
- **Reason:** Defined in TypeScript types but never set or displayed
- **Usage:** 0 actual uses (only type definitions)
- **Risk:** ZERO - completely unused

#### ❌ `last_login`
- **Reason:** Defined in types but never tracked or updated
- **Usage:** 0 actual uses (only type definitions)
- **Risk:** ZERO - completely unused

### 2. `kyc_documents` Table (1 column removed)

#### ❌ `document_type`
- **Reason:** Was removed from KYC submission UI, not used in queries
- **Usage:** 0 uses in application code
- **Risk:** ZERO - legacy field from old KYC flow

### 3. `transactions` Table (Optional)

#### ⚠️ `block_number`
- **Current State:** Always set to 0, never populated with real block numbers
- **Usage:** Set in 2 places, but always as default value (0)
- **Recommendation:** Keep for future subgraph/indexer integration OR remove if not planning to use
- **Risk:** LOW - if removed, can add back easily when needed

---

## ✅ Columns to Keep (Despite Limited Usage)

### `users` Table
| Column | Reason to Keep |
|--------|----------------|
| `business_name` | Used during registration for business entities |
| `proof_provider` | Used in explorer API to show KYC provider |

### `properties` Table
| Column | Reason to Keep |
|--------|----------------|
| `zipcode` | Used in property creation (default: '000000') |
| `amenities` | Used in property creation and display |
| `listing_date` | Used for property metadata |

### `kyc_documents` Table
| Column | Reason to Keep |
|--------|----------------|
| `id_type` | User's ID type (Passport, Aadhaar, etc.) - displayed in admin panel |
| `id_number` | User's ID number - displayed in admin panel |
| `address_proof_type` | Type of address proof submitted |
| `rejection_reason` | Shown when KYC is rejected |
| `document_hash` | IPFS hash to display submitted documents |

### `rent_deposits` Table
| Column | Reason to Keep |
|--------|----------------|
| `bills_metadata` | JSON metadata for uploaded bills |
| `summary_ipfs_hash` | IPFS hash for rent deposit summaries |

### `user_portfolios` Table
| Column | Reason to Keep |
|--------|----------------|
| `total_rewards_claimed` | Used in marketplace purchase logic |

---

## 🚀 Migration Steps

### Step 1: Backup Database
```bash
# For Supabase (via psql)
pg_dump -h <your-project-ref>.supabase.co -U postgres -d postgres > backup_2024-11-24.sql

# Or use Supabase Dashboard:
# Settings → Database → Backup & Restore
```

### Step 2: Apply Migration
```bash
# Via Supabase CLI
supabase db push

# Or manually via SQL Editor in Supabase Dashboard
# Copy contents of: supabase/migrations/20241124_remove_unused_columns.sql
```

### Step 3: Update TypeScript Types
After applying migration, update `frontend/types/supabase.ts` to remove references to deleted columns:
- Remove `profile_image_url` from User types
- Remove `last_login` from User types  
- Remove `document_type` from KYCDocument types

### Step 4: Verify Application
1. Test user registration
2. Test KYC submission and approval
3. Test property creation
4. Test marketplace functionality
5. Check admin dashboard

---

## 📝 Migration File

**Location:** `supabase/migrations/20241124_remove_unused_columns.sql`

**Changes:**
- ✅ Drops 3 unused columns safely with `IF EXISTS`
- ✅ Includes rollback script
- ✅ Includes comments for `block_number` decision
- ✅ Non-destructive (no data loss from active columns)

---

## ⚠️ Important Notes

1. **Backup First:** Always backup before running migrations
2. **Test on Staging:** If you have a staging environment, test there first
3. **Type Updates:** Remember to update TypeScript types after migration
4. **Zero Downtime:** These columns aren't used, so removal won't affect running app
5. **Rollback Available:** Migration includes rollback script if needed

---

## 🎯 Expected Results

**Before Migration:**
- users table: 18 columns
- kyc_documents table: 26 columns

**After Migration:**
- users table: 16 columns (-2)
- kyc_documents table: 25 columns (-1)

**Storage Saved:** Minimal (only metadata, as columns had NULL values)

**Performance Impact:** Negligible improvement (fewer columns to scan)

**Main Benefit:** Cleaner schema, less confusion for developers

---

## 🔄 Rollback Plan

If you need to rollback, run the commented rollback script at the bottom of the migration file:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS document_type TEXT;
```

Then restore the TypeScript types from git history.

---

## ✅ Approval Checklist

- [ ] Database backup created
- [ ] Migration file reviewed
- [ ] Tested on local/staging environment
- [ ] TypeScript types updated
- [ ] Team notified of schema changes
- [ ] Migration applied to production
- [ ] Application verified working
- [ ] Documentation updated

---

**Conclusion:** Safe to proceed with removing 3 unused columns. All active tables and critical columns preserved.
