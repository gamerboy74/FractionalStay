# KYC Database Schema Fix

## Problem
The `kyc_documents` table was missing personal information columns needed for the new KYC flow.

## Solution
Run the migration SQL to add the required columns.

## Steps to Fix

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor

### 2. Run Migration SQL
Copy and paste this SQL into the SQL Editor and click "Run":

```sql
-- Migration: Update KYC Documents Table
-- Add personal information fields to kyc_documents table

-- Add new columns for personal information
ALTER TABLE kyc_documents 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS address_proof_type TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Copy user_wallet to wallet_address for existing records
UPDATE kyc_documents 
SET wallet_address = user_wallet 
WHERE wallet_address IS NULL;

-- Create index on wallet_address
CREATE INDEX IF NOT EXISTS idx_kyc_wallet_address ON kyc_documents(wallet_address);
```

### 3. Verify Columns
After running, verify the table has these columns:

**Original columns:**
- id
- user_wallet
- document_type
- document_hash
- status
- rejection_reason
- submitted_at
- reviewed_at
- reviewed_by

**New columns added:**
- wallet_address
- full_name
- date_of_birth
- nationality
- address
- city
- state
- pincode
- id_type
- id_number
- address_proof_type
- updated_at

### 4. Test KYC Submission
After migration:
1. Restart Next.js dev server
2. Go to http://localhost:3000/kyc
3. Fill out all 3 steps
4. Upload documents
5. Submit KYC

Should now work without errors!

## Changes Made to API

Updated `/app/api/kyc/submit/route.ts` to:
- Use `user_wallet` column (old column, still present for backward compatibility)
- Insert `wallet_address` column value (new column)
- Insert all personal information fields
- Better error logging with details, hints, and error codes

## Alternative: Manual Column Addition

If SQL Editor doesn't work, you can add columns manually:

1. Go to Table Editor → kyc_documents
2. Click "Add Column" for each:
   - wallet_address (TEXT)
   - full_name (TEXT)
   - date_of_birth (DATE)
   - nationality (TEXT)
   - address (TEXT)
   - city (TEXT)
   - state (TEXT)
   - pincode (TEXT)
   - id_type (TEXT)
   - id_number (TEXT)
   - address_proof_type (TEXT)
   - updated_at (TIMESTAMPTZ)
