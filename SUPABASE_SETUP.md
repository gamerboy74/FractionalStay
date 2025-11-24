# Supabase Setup - Quick Start Guide

## Step 1: Create Supabase Project (5 minutes)

1. **Go to Supabase**: https://supabase.com
2. **Sign in** with GitHub/Google
3. **Create New Project**:
   - Organization: Create new or select existing
   - Project Name: `FractionalStay` or `FractionalEstate`
   - Database Password: Generate strong password (save it!)
   - Region: Select closest to you (e.g., `us-east-1`)
   - Pricing Plan: **Free** (500MB database, 500MB file storage)
4. **Wait 2-3 minutes** for project to initialize

## Step 2: Run Database Schema (2 minutes)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. **Copy entire content** from `supabase/schema.sql`
5. **Paste** into SQL editor
6. Click **"Run"** button (or press `Ctrl+Enter`)
7. ✅ You should see: "Success. No rows returned"

## Step 3: Get API Keys (1 minute)

1. Go to **Settings** > **API** (left sidebar)
2. Copy these 3 values:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Update .env.local (1 minute)

Open `frontend/.env.local` and replace:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: 
- `NEXT_PUBLIC_*` = Safe to use in browser
- `SERVICE_ROLE_KEY` = **NEVER expose in browser**, only use in API routes

## Step 5: Test Connection (1 minute)

Create test API route:

```typescript
// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
    
    if (error) throw error
    
    return NextResponse.json({ 
      status: 'Connected ✅', 
      tables: ['users', 'properties', 'transactions', 'kyc_documents', 'user_portfolios']
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'Error ❌', 
      message: error.message 
    }, { status: 500 })
  }
}
```

Visit: http://localhost:3000/api/test-db

Should see: `{ "status": "Connected ✅", ... }`

## Step 6: Verify Tables (Optional)

In Supabase dashboard:
1. Go to **Table Editor** (left sidebar)
2. You should see 6 tables:
   - ✅ users
   - ✅ properties  
   - ✅ transactions
   - ✅ kyc_documents
   - ✅ user_portfolios
   - ✅ marketplace_listings

## Common Issues & Fixes

### Issue: "relation 'users' does not exist"
**Fix**: You didn't run the schema.sql. Go back to Step 2.

### Issue: "Invalid API key"
**Fix**: Check you copied the correct keys from Settings > API

### Issue: "CORS error"
**Fix**: In Supabase dashboard:
1. Settings > API
2. Add `http://localhost:3000` to allowed origins

### Issue: RLS (Row Level Security) blocking queries
**Fix**: For development, temporarily disable RLS:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- Do this for other tables too
```
⚠️ Re-enable in production!

## Next Steps

Now you can:

1. **Save users to database** when they register on blockchain
2. **Store property details** for fast search/filters  
3. **Build dashboards** with complex queries
4. **Add analytics** and reporting

## Example Usage

### Save User After Blockchain Registration

```typescript
// app/register/page.tsx
import { supabase } from '@/lib/supabase'

// After successful blockchain transaction
const { data, error } = await supabase
  .from('users')
  .insert({
    wallet_address: address,
    role: 'CLIENT',
    kyc_status: 'NONE',
    name: formData.name,
    email: formData.email,
  })
```

### Fetch User Properties

```typescript
const { data: properties } = await supabase
  .from('user_portfolios')
  .select(`
    *,
    properties (
      name,
      location,
      images
    )
  `)
  .eq('user_wallet', address)
```

### Search Properties

```typescript
const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'ACTIVE')
  .ilike('city', '%Mumbai%')
  .gte('price_per_share', 1000)
  .lte('price_per_share', 10000)
  .order('created_at', { ascending: false })
```

## Resources

- Supabase Docs: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

## Estimated Setup Time

- ✅ Create Project: 5 min
- ✅ Run Schema: 2 min  
- ✅ Get Keys: 1 min
- ✅ Update .env: 1 min
- ✅ Test: 1 min

**Total: ~10 minutes** ⏱️

---

**Ready!** Database setup complete. Ab frontend se database use kar sakte ho! 🚀
