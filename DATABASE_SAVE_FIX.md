# Database Save Troubleshooting Guide

## ✅ Changes Made:

### 1. Frontend: CreatePropertyContent.tsx
**Fixed field mappings:**
- `owner_address` → `seller_wallet`
- Added `address`, `city`, `state`, `zipcode` fields
- Changed `status: 'PENDING'` → `status: 'DRAFT'`

### 2. Backend: /api/properties/create
**Schema-compliant fields:**
- Uses `seller_wallet` (matches DB foreign key)
- Parses location into `city` and `state`
- Defaults: `zipcode: '000000'`, `status: 'DRAFT'`
- **Auto-creates user** if not exists (fixes foreign key constraint)

### 3. User Auto-Creation
If seller doesn't exist in `users` table:
```sql
INSERT INTO users (wallet_address, role, kyc_status, name, email)
VALUES ('0x...', 'SELLER', 'NONE', 'Seller', 'temp@email.com');
```

---

## 🔍 Testing Steps:

### 1. Check Browser Console Logs
Look for these messages:
```
✅ Transaction confirmed, extracting tokenId
🎯 TokenId extracted from logs: 7
💾 Saving property to database
✅ Property saved to database
```

### 2. Check Server Logs (Terminal)
```bash
# In frontend terminal, watch for:
Inserting property into database { token_id: '7', seller_wallet: '0x...', ... }
Property saved to database { token_id: '7', name: '...', owner: '0x...' }
```

### 3. Verify in Supabase Dashboard
```sql
-- Check if property was saved
SELECT token_id, name, seller_wallet, status, created_at 
FROM properties 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if user exists
SELECT wallet_address, role, kyc_status 
FROM users 
WHERE wallet_address = '0x8e1e7f06c9d62edeb55ff9d9c45d3d8d97a905a6';
```

---

## 🐛 Common Issues & Fixes:

### Issue 1: Foreign Key Constraint Error
**Error:** `insert or update on table "properties" violates foreign key constraint`

**Fix:** ✅ Auto-create user entry (already implemented)

### Issue 2: TokenId Extraction Failed
**Symptom:** Using timestamp as fallback tokenId

**Fix:** Check ABI has PropertyCreated event:
```typescript
// In browser console:
import { PROPERTY_SHARE_1155_ABI } from '@/lib/contracts'
console.log(PROPERTY_SHARE_1155_ABI.filter(x => x.type === 'event'))
```

### Issue 3: Column Does Not Exist
**Error:** `column "owner_address" does not exist`

**Fix:** ✅ Changed to `seller_wallet` (already fixed)

### Issue 4: Enum Value Invalid
**Error:** `invalid input value for enum property_status: "PENDING"`

**Fix:** ✅ Changed to `'DRAFT'` (already fixed)

---

## 📊 Database Schema Reference:

### Properties Table Required Fields:
```typescript
{
  token_id: string,           // BIGINT (from blockchain)
  seller_wallet: string,      // TEXT (foreign key → users)
  name: string,               // TEXT
  description: string,        // TEXT
  location: string,           // TEXT (full address)
  address: string,            // TEXT (property address)
  city: string,               // TEXT
  state: string,              // TEXT
  zipcode: string,            // TEXT
  property_type: enum,        // APARTMENT | VILLA | LAND | COMMERCIAL
  total_shares: number,       // BIGINT
  price_per_share: string,    // DECIMAL(20, 6)
  images: string[],           // TEXT[]
  amenities: string[],        // TEXT[]
  metadata_uri: string,       // TEXT (ipfs://...)
  status: enum                // DRAFT | ACTIVE | SOLD | DELISTED
}
```

---

## 🚀 Next Property Creation Will:

1. ✅ Upload files to IPFS
2. ✅ Get metadataUri
3. ✅ Call contract (blockchain)
4. ✅ Extract real tokenId from event
5. ✅ Auto-create user if needed
6. ✅ Save property with correct fields
7. ✅ Redirect to seller dashboard

---

## ✅ Test Now:

1. **Refresh browser** (hard reload: Ctrl+Shift+R)
2. **Create new property**
3. **Watch console logs** for emoji indicators
4. **Check Supabase** for new row in `properties` table
5. **Verify tokenId** matches blockchain

---

**Status:** All fixes applied ✅
**Ready to test!** 🚀
