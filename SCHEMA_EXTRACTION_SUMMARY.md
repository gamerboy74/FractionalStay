# Database Schema Extraction Summary

## ✅ What Was Done

1. **Created extraction script** (`scripts/extract-full-schema.ts`) that:
   - Discovers all tables in your database
   - Analyzes each table's structure from sample data
   - Generates a migration file matching the actual database

2. **Generated migration file** (`supabase/migrations/20251124000000_complete_schema.sql`)
   - Extracted schema for **10 tables**:
     - users
     - kyc_documents
     - properties
     - transactions
     - user_portfolios
     - marketplace_listings
     - ward_boy_mappings
     - rent_deposits
     - indexer_state
     - blockchain_events

## ⚠️ Issues Found in Generated Schema

The generated schema has some issues that need manual review:

1. **Missing PRIMARY KEY declarations** - Some `id` columns don't have `PRIMARY KEY` explicitly set
2. **Incorrect foreign keys** - Some FK references don't exist (e.g., `sbt`, `token`, `listing`, `property`)
3. **Data type mismatches** - Some numeric fields might be INTEGER instead of DECIMAL
4. **Missing constraints** - Some CHECK constraints and UNIQUE constraints might be missing
5. **Missing RLS policies** - Policies need to be added manually

## 🔧 How to Get the EXACT Schema

### Option 1: Use Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. For each table, click on it to see:
   - All columns with exact types
   - Constraints
   - Indexes
   - Foreign keys

### Option 2: Run SQL Query in Supabase SQL Editor

Run this query to get detailed column information:

```sql
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### Option 3: Use pg_dump (If you have direct database access)

```bash
pg_dump -h <host> -U <user> -d <database> --schema-only > schema.sql
```

## 📋 Next Steps

1. **Review the generated migration file** - Compare with your original
2. **Fix PRIMARY KEY declarations** - Add `PRIMARY KEY` to all `id` columns
3. **Fix foreign keys** - Remove or correct invalid foreign key references
4. **Add missing constraints** - Review CHECK constraints and UNIQUE constraints
5. **Add RLS policies** - Copy policies from your original migration file
6. **Verify data types** - Ensure DECIMAL types for price fields
7. **Add missing indexes** - Compare with original migration

## 🔍 Key Differences to Check

- **users table**: Check if `wallet_address` should be UNIQUE
- **properties table**: Verify `price_per_share` is DECIMAL, not INTEGER
- **transactions table**: Check column names (might be `transaction_type` not `type`)
- **marketplace_listings**: Check if `property_token_id` exists instead of `token_id`
- **rent_deposits**: Verify all columns from original migration are present

## 📝 Manual Fixes Needed

1. Add PRIMARY KEY to all id columns:
   ```sql
   ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();
   -- Then add PRIMARY KEY constraint
   ```

2. Remove invalid foreign keys:
   - `fk_users_sbt_token_id` (references non-existent `sbt` table)
   - `fk_kyc_documents_sbt_token_id` (references non-existent `sbt` table)
   - `fk_properties_token_id` (references non-existent `token` table)
   - `fk_marketplace_listings_listing_id` (references non-existent `listing` table)

3. Add UNIQUE constraints where needed:
   ```sql
   ALTER TABLE users ADD CONSTRAINT users_wallet_address_unique UNIQUE (wallet_address);
   ALTER TABLE properties ADD CONSTRAINT properties_token_id_unique UNIQUE (token_id);
   ```

4. Fix data types:
   ```sql
   ALTER TABLE properties ALTER COLUMN price_per_share TYPE DECIMAL(20, 6);
   ALTER TABLE marketplace_listings ALTER COLUMN price_per_share TYPE DECIMAL(20, 6);
   ```

## 🎯 Recommended Approach

1. Keep the generated file as a reference
2. Manually merge with your original migration file
3. Test the updated migration on a fresh database
4. Verify all constraints, indexes, and policies are correct

