# Database Setup Guide

## Overview
This project uses a **hybrid approach**:
- **Blockchain**: Ownership, transactions, critical data (immutable)
- **Database**: User profiles, property details, search/filters (fast queries)
- **IPFS**: Files, images, documents (decentralized storage)

## Database Options

### Option 1: Supabase (Recommended - Easy Setup)
**Pros:**
- Free tier (500MB database)
- Built-in authentication
- Realtime subscriptions
- Auto-generated REST API
- PostgreSQL (reliable)

**Setup:**
```bash
# 1. Create account: https://supabase.com
# 2. Create new project
# 3. Copy database URL
# 4. Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# 5. Install Supabase client
cd frontend
npm install @supabase/supabase-js
```

### Option 2: MongoDB Atlas (NoSQL)
**Pros:**
- Free tier (512MB storage)
- Flexible schema
- Good for JSON data
- Easy scaling

**Setup:**
```bash
# 1. Create account: https://www.mongodb.com/cloud/atlas
# 2. Create cluster
# 3. Add to .env.local
MONGODB_URI=mongodb+srv://...

# 4. Install MongoDB driver
npm install mongodb mongoose
```

### Option 3: Prisma + PostgreSQL (Self-hosted)
**Pros:**
- Type-safe ORM
- Migration management
- Works with any PostgreSQL
- Good for complex queries

**Setup:**
```bash
# 1. Install Prisma
npm install prisma @prisma/client

# 2. Initialize Prisma
npx prisma init

# 3. Add to .env
DATABASE_URL=postgresql://user:pass@localhost:5432/fractional_estate

# 4. Create schema (see below)
```

## Recommended Database Schema

### Tables/Collections:

#### 1. **users**
```sql
- id (uuid/string, PRIMARY KEY)
- wallet_address (string, UNIQUE, INDEXED)
- role (enum: CLIENT, SELLER, ADMIN)
- kyc_status (enum: NONE, PENDING, APPROVED, REJECTED)
- name (string)
- email (string, UNIQUE)
- phone (string, optional)
- business_name (string, optional - for sellers)
- profile_image_url (string, optional)
- created_at (timestamp)
- updated_at (timestamp)
- last_login (timestamp)
```

#### 2. **properties**
```sql
- id (uuid/string, PRIMARY KEY)
- token_id (bigint, UNIQUE, INDEXED) # From blockchain
- seller_wallet (string, FOREIGN KEY -> users.wallet_address)
- name (string)
- location (string)
- address (string)
- city (string)
- state (string)
- zipcode (string)
- description (text)
- property_type (enum: APARTMENT, VILLA, LAND, COMMERCIAL)
- total_shares (bigint)
- price_per_share (decimal)
- images (array of strings - IPFS hashes)
- amenities (array of strings)
- metadata_uri (string - IPFS hash)
- listing_date (timestamp)
- status (enum: DRAFT, ACTIVE, SOLD, DELISTED)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. **transactions**
```sql
- id (uuid/string, PRIMARY KEY)
- tx_hash (string, UNIQUE, INDEXED)
- type (enum: MINT, TRANSFER, PURCHASE, RENT_DEPOSIT, CLAIM)
- from_wallet (string)
- to_wallet (string)
- token_id (bigint, INDEXED)
- amount (bigint)
- price (decimal, optional)
- timestamp (timestamp)
- block_number (bigint)
- status (enum: PENDING, SUCCESS, FAILED)
- created_at (timestamp)
```

#### 4. **marketplace_listings**
```sql
- id (uuid/string, PRIMARY KEY)
- listing_id (bigint, UNIQUE, INDEXED) # From blockchain
- seller_wallet (string, INDEXED)
- token_id (bigint, INDEXED)
- property_name (string) # Denormalized for fast queries
- shares_amount (bigint)
- price_per_share (decimal)
- total_price (decimal)
- status (enum: ACTIVE, CANCELLED, SOLD)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. **kyc_documents**
```sql
- id (uuid/string, PRIMARY KEY)
- user_wallet (string, FOREIGN KEY -> users.wallet_address)
- document_type (enum: PASSPORT, ID_CARD, DRIVER_LICENSE, BUSINESS_CERT)
- document_hash (string) # IPFS hash
- status (enum: PENDING, APPROVED, REJECTED)
- rejection_reason (text, optional)
- submitted_at (timestamp)
- reviewed_at (timestamp, optional)
- reviewed_by (string, optional) # Admin wallet
```

#### 6. **user_portfolios**
```sql
- id (uuid/string, PRIMARY KEY)
- user_wallet (string, INDEXED)
- token_id (bigint, INDEXED)
- property_name (string) # Denormalized
- shares_owned (bigint)
- total_invested (decimal)
- total_rewards_claimed (decimal)
- last_updated (timestamp)
```

#### 7. **analytics** (Optional)
```sql
- id (uuid/string, PRIMARY KEY)
- metric_name (string)
- metric_value (jsonb/object)
- date (date, INDEXED)
- created_at (timestamp)
```

## Implementation Plan

### Phase 1: Setup Database
```bash
# Choose Supabase for fastest setup
1. Create Supabase project
2. Run schema SQL in Supabase SQL editor
3. Configure .env.local
```

### Phase 2: Create Database Helper
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Phase 3: Create API Routes
```typescript
// app/api/users/[wallet]/route.ts
// app/api/properties/route.ts
// app/api/properties/[id]/route.ts
// app/api/transactions/route.ts
// app/api/kyc/submit/route.ts
```

### Phase 4: Sync Blockchain Events
```typescript
// Use wagmi hooks to watch events and update database
// Example: When user registers on blockchain, save to database
import { useWatchContractEvent } from 'wagmi'

useWatchContractEvent({
  address: CONTRACTS.UserRegistry,
  abi: USER_REGISTRY_ABI,
  eventName: 'UserRegistered',
  onLogs(logs) {
    // Save to database
    fetch('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify(logs)
    })
  }
})
```

## Data Flow

### Registration Flow:
```
1. User fills form → Frontend
2. Submit to blockchain → UserRegistry.registerAsClient()
3. Wait for transaction → useWaitForTransactionReceipt
4. On success → POST /api/users (save to database)
5. Database saves user profile
6. Frontend shows success
```

### Property Creation Flow:
```
1. Seller uploads images → IPFS (Pinata)
2. Create metadata JSON → IPFS
3. Submit to blockchain → PropertyShare1155.createProperty()
4. On success → POST /api/properties (save to database)
5. Database saves property details
6. Property appears in marketplace
```

### Dashboard Query Flow:
```
1. User opens dashboard
2. GET /api/users/[wallet]/portfolio
3. Database returns fast results
4. Frontend displays data
5. Background: Verify with blockchain (optional)
```

## Why Hybrid Approach?

### Blockchain (Source of Truth):
- ✅ Ownership records (who owns what shares)
- ✅ Transaction history (immutable)
- ✅ KYC approval status
- ✅ Critical financial data

### Database (Fast Queries):
- ✅ User profiles (name, email, etc.)
- ✅ Property search & filters
- ✅ Dashboard analytics
- ✅ Real-time updates
- ✅ Complex queries (joins, aggregations)

### IPFS (File Storage):
- ✅ Images
- ✅ Documents
- ✅ Large metadata

## Security

### Database Security:
- ✅ Row Level Security (RLS) in Supabase
- ✅ API routes validate wallet signatures
- ✅ Admin operations require admin role check
- ✅ No sensitive data in database (KYC docs on IPFS only)

### Data Verification:
```typescript
// Always verify critical data with blockchain
const dbBalance = await getBalanceFromDB(wallet, tokenId)
const blockchainBalance = await contract.balanceOf(wallet, tokenId)

if (dbBalance !== blockchainBalance) {
  // Re-sync from blockchain
  await syncFromBlockchain(wallet, tokenId)
}
```

## Next Steps

1. **Choose database**: Supabase recommended for fast setup
2. **Create schema**: Use SQL above
3. **Install client**: `npm install @supabase/supabase-js`
4. **Configure .env**: Add database credentials
5. **Create API routes**: CRUD operations
6. **Sync events**: Blockchain → Database
7. **Update frontend**: Use database for queries

## Estimated Time
- **Supabase setup**: 30 minutes
- **Schema creation**: 1 hour
- **API routes**: 2-3 hours
- **Event syncing**: 2 hours
- **Frontend updates**: 2-3 hours
- **Total**: ~8-10 hours

## Resources
- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas
