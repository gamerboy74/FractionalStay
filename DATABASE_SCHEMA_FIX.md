# Database Schema Fix

## Issue
The API routes were using incorrect column names that didn't match the actual database schema:
- ❌ Used `owner_address` → ✅ Should be `seller_wallet`
- ❌ Used `is_active` (boolean) → ✅ Should be `status` (enum: DRAFT, ACTIVE, SOLD, DELISTED)
- ❌ Expected `available_shares` → ✅ Not in schema (can be calculated from blockchain)
- ❌ Expected `expected_annual_return` → ✅ Not in schema

## Changes Made

### 1. API Routes Fixed
- ✅ `frontend/app/api/properties/list/route.ts`
  - Changed `owner_address` → `seller_wallet`
  - Changed `is_active` → `status`
  
- ✅ `frontend/app/api/admin/stats/route.ts`
  - Changed `is_active` → `status`
  
- ✅ `frontend/app/api/admin/properties/[id]/status/route.ts`
  - Changed `is_active` boolean → `status` enum
  - Added validation for status values

### 2. Components Updated
- ✅ `frontend/components/seller/SellerPropertiesContent.tsx`
  - Updated Property interface to match actual schema
  - Changed filters to use `status` instead of `is_active`
  - Removed references to non-existent fields

- ✅ `frontend/components/admin/PropertiesManagement.tsx`
  - Updated Property interface to match actual schema
  - Changed status toggle to use enum values
  - Updated UI to show proper status badges

### 3. New Page Created
- ✅ `frontend/app/seller/properties/page.tsx` - Seller properties list page

## Correct Database Schema

The `properties` table has these columns:
```sql
- id (UUID)
- token_id (BIGINT) - NFT token ID
- seller_wallet (TEXT) - Owner's wallet address
- name (TEXT)
- location (TEXT)
- address (TEXT)
- city (TEXT)
- state (TEXT)
- zipcode (TEXT)
- description (TEXT)
- property_type (ENUM: APARTMENT, VILLA, LAND, COMMERCIAL)
- total_shares (BIGINT)
- price_per_share (DECIMAL)
- images (TEXT[])
- amenities (TEXT[])
- metadata_uri (TEXT)
- listing_date (TIMESTAMPTZ)
- status (ENUM: DRAFT, ACTIVE, SOLD, DELISTED)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## Optional: Add Missing Columns

If you need `available_shares` and `expected_annual_return`, run this SQL:

```sql
-- Add available_shares (tracks shares not yet sold)
ALTER TABLE properties 
ADD COLUMN available_shares BIGINT DEFAULT 0;

-- Add expected_annual_return (ROI percentage)
ALTER TABLE properties 
ADD COLUMN expected_annual_return DECIMAL(5,2);

-- Update available_shares to equal total_shares for existing properties
UPDATE properties 
SET available_shares = total_shares 
WHERE available_shares IS NULL OR available_shares = 0;
```

However, it's better to calculate `available_shares` from blockchain data since it's the source of truth.

## Status Values
- **DRAFT** - Property created but not yet published
- **ACTIVE** - Listed and available for purchase
- **SOLD** - All shares sold
- **DELISTED** - Removed from marketplace (admin action)

## Testing
After restart, test these endpoints:
- `GET /api/properties/list` - Should work without errors
- `GET /api/properties/list?owner=0x...` - Filter by seller
- `GET /api/properties/list?status=ACTIVE` - Filter by status
- `PUT /api/admin/properties/{id}/status` - Update status
