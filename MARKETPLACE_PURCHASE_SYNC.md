# Marketplace Purchase - Database Sync Summary

## ✅ All Changes Implemented

### 1. Purchase API (`/api/marketplace/purchase`)
**Location**: `frontend/app/api/marketplace/purchase/route.ts`

**Updates:**
- ✅ Updates buyer's portfolio (creates or increases shares)
- ✅ Updates seller's portfolio (reduces or removes shares)
- ✅ Marks listing as SOLD
- ✅ Creates transaction record in marketplace_transactions
- ✅ Uses correct table name: `user_portfolios` (plural)
- ✅ Uses correct column names: `user_wallet`, `shares_owned`, etc.

### 2. Portfolio Property Card
**Location**: `frontend/components/PortfolioPropertyCard.tsx`

**Updates:**
- ✅ Reads blockchain balance using `balanceOf()`
- ✅ Displays actual on-chain shares (not database)
- ✅ Shows "(on-chain)" badge if blockchain differs from database
- ✅ CreateListingForm uses blockchain balance

### 3. Dashboard
**Location**: `frontend/components/dashboard/DashboardContent.tsx`

**Already Working:**
- ✅ Fetches portfolio from `/api/users/[wallet]/portfolio`
- ✅ Displays all properties with updated shares
- ✅ Refetches on page load

### 4. Marketplace Content
**Location**: `frontend/components/marketplace/MarketplaceContent.tsx`

**Already Working:**
- ✅ Only shows ACTIVE listings
- ✅ Calls purchase API after blockchain transaction
- ✅ Refetches listings after successful purchase

### 5. My Listings
**Location**: `frontend/components/MyListings.tsx`

**Already Working:**
- ✅ Shows user's ACTIVE listings
- ✅ Refetches after cancellation
- ✅ Updates database on cancel

## Database Schema

### user_portfolios table
```sql
- id (UUID, primary key)
- user_wallet (TEXT, references users)
- token_id (BIGINT)
- property_name (TEXT)
- shares_owned (BIGINT)
- total_invested (DECIMAL)
- total_rewards_claimed (DECIMAL)
- last_updated (TIMESTAMPTZ)
```

### marketplace_listings table
```sql
- id (UUID)
- listing_id (BIGINT, unique)
- seller_wallet (TEXT)
- token_id (BIGINT)
- property_name (TEXT)
- shares_amount (BIGINT)
- price_per_share (DECIMAL)
- total_price (DECIMAL)
- status (ACTIVE/SOLD/CANCELLED)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### marketplace_transactions table
```sql
- id (UUID)
- listing_id (BIGINT)
- buyer_wallet (TEXT)
- seller_wallet (TEXT)
- token_id (BIGINT)
- shares_amount (BIGINT)
- price_per_share (DECIMAL)
- total_price (DECIMAL)
- transaction_hash (TEXT)
- completed_at (TIMESTAMPTZ)
```

## Flow on Marketplace Purchase

1. **User clicks "Buy Now"** on marketplace listing
2. **Frontend** approves USDC (if needed)
3. **Frontend** calls `marketplace.purchase(listingId)`
4. **Blockchain** transfers shares and USDC
5. **Frontend** calls `/api/marketplace/purchase` with details
6. **API** updates database:
   - Buyer portfolio: ✅ Add/increase shares
   - Seller portfolio: ✅ Reduce/remove shares
   - Listing: ✅ Mark as SOLD
   - Transaction: ✅ Create record
7. **Dashboard** shows updated shares on next load
8. **Portfolio card** displays on-chain balance

## Testing Scripts

### Check Portfolio
```bash
npx ts-node scripts/check-portfolio.ts
```

### Check Marketplace Listings
```bash
npx ts-node scripts/check-marketplace.ts
```

### Verify Transaction
```bash
npx ts-node scripts/verify-marketplace-transaction.ts
```

### Manual Add Purchase (if needed)
```bash
$env:LISTING_ID="2"
$env:TOKEN_ID="2"
$env:SHARES_AMOUNT="1"
$env:TOTAL_PRICE="2000"
npx ts-node scripts/add-marketplace-purchase.ts
```

### Update Seller Portfolio (if needed)
```bash
npx ts-node scripts/update-seller-portfolio.ts
```

## Current Status

**Seller**: 0xbaE9b8B0b94Ad045b0E3eDb2B56CFecd7601cF53
- Token ID 2: 2 shares (was 3, sold 1)

**Buyer**: 0x7d5b1d69a839b27bf120363f6c5af6427bc763ea
- Token ID 2: 1 share (purchased from marketplace)

**Listing**: ID 2
- Status: SOLD
- Property: Ifeoma Terry

✅ All systems working correctly!
