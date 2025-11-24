# Marketplace Purchase Flow - Complete Database Integration

## 🔄 Complete Purchase Flow

### When a buyer purchases shares from the marketplace:

1. **Buyer clicks "Buy Now"** on a listing
   - Frontend validates USDC balance and allowance
   - Calls `Marketplace.purchase(listingId)` smart contract function

2. **Smart Contract Execution**
   - Transfers USDC from buyer to seller (97.5%)
   - Transfers 2.5% fee to marketplace fee recipient
   - Transfers property shares from marketplace escrow to buyer
   - Marks listing as inactive on-chain

3. **Frontend receives transaction success**
   - `useWaitForTransactionReceipt` hook detects confirmation
   - Triggers database sync

4. **Database Update via API** (`/api/marketplace/purchase`)
   - Updates `marketplace_listings` status to 'SOLD'
   - Updates or creates buyer's `user_portfolio` entry
   - Creates record in `marketplace_transactions` (trade history)

5. **UI Updates**
   - Removes listing from marketplace page
   - Shows success message
   - Buyer's dashboard reflects new shares

---

## 📊 Database Tables Updated

### 1. marketplace_listings
```sql
UPDATE marketplace_listings 
SET status = 'SOLD', updated_at = NOW()
WHERE listing_id = ?
```

**Status Flow:** `ACTIVE` → `SOLD`

### 2. user_portfolio (Buyer)
```sql
-- If buyer already owns shares of this property:
UPDATE user_portfolio 
SET shares_owned = shares_owned + new_shares,
    total_invested = total_invested + purchase_price,
    last_updated = NOW()
WHERE wallet_address = ? AND token_id = ?

-- If first purchase of this property:
INSERT INTO user_portfolio (
  wallet_address,
  token_id,
  property_name,
  shares_owned,
  total_invested,
  current_value,
  purchase_price_per_share
) VALUES (?, ?, ?, ?, ?, ?, ?)
```

### 3. marketplace_transactions (Trade History)
```sql
INSERT INTO marketplace_transactions (
  listing_id,
  buyer_wallet,
  seller_wallet,
  token_id,
  shares_amount,
  price_per_share,
  total_price,
  transaction_hash,
  completed_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

---

## 🎯 What Gets Recorded

### Purchase Details:
- ✅ Listing ID (reference to original listing)
- ✅ Buyer wallet address
- ✅ Seller wallet address
- ✅ Property token ID
- ✅ Number of shares traded
- ✅ Price per share
- ✅ Total transaction price
- ✅ Transaction hash (blockchain proof)
- ✅ Timestamp of completion

### Portfolio Updates:
- ✅ Buyer's total shares for property
- ✅ Buyer's total investment amount
- ✅ Updated current value
- ✅ Last updated timestamp

---

## 🔧 API Endpoint Details

### POST /api/marketplace/purchase

**Request Body:**
```json
{
  "listingId": 1,
  "buyerWallet": "0x123...",
  "sellerWallet": "0x456...",
  "tokenId": 1,
  "sharesAmount": 10,
  "totalPrice": "1000.00",
  "transactionHash": "0xabc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase recorded successfully"
}
```

**Error Handling:**
- Missing fields → 400 Bad Request
- Database errors → Logged but doesn't fail (blockchain is source of truth)
- Transaction table missing → Gracefully ignored

---

## 📱 User Experience

### Buyer sees:
1. "Waiting for wallet confirmation..." (isPending)
2. "Transaction confirming on blockchain..." (isConfirming)
3. "Purchase successful! Updating records..." (isSuccess)
4. Listing disappears from marketplace
5. Shares appear in dashboard

### Seller sees:
1. USDC arrives in wallet (97.5% of listing price)
2. Listing removed from "My Listings"
3. Shares no longer in portfolio (were in escrow)

---

## 🔍 Database Schema

### marketplace_transactions Table
```sql
CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY,
  listing_id BIGINT NOT NULL,
  buyer_wallet TEXT NOT NULL,
  seller_wallet TEXT NOT NULL,
  token_id BIGINT NOT NULL,
  shares_amount BIGINT NOT NULL,
  price_per_share TEXT NOT NULL,
  total_price TEXT NOT NULL,
  transaction_hash TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Indexes:**
- `buyer_wallet` - Fast buyer history lookup
- `seller_wallet` - Fast seller history lookup
- `token_id` - Property trade history
- `listing_id` - Original listing reference
- `completed_at` - Time-based queries

---

## 🎨 Frontend Components

### MarketplaceContent.tsx
- Handles purchase transaction
- Calls database API on success
- Updates UI with status messages
- Refetches listings after completion

### Key Hooks Used:
```typescript
const { writeContract, data: hash, isPending } = useWriteContract()
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

useEffect(() => {
  if (isSuccess && actionType === 'purchase' && selectedListing) {
    // Call API to record purchase
    // Update database
    // Refetch listings
  }
}, [isSuccess, actionType, selectedListing])
```

---

## ✅ Success Criteria

After a successful purchase:
- ✅ Blockchain shows shares transferred
- ✅ Listing status = 'SOLD' in database
- ✅ Buyer's portfolio updated with new shares
- ✅ Transaction recorded in history table
- ✅ UI shows success message
- ✅ Marketplace page refreshed (listing gone)
- ✅ Dashboard shows updated portfolio

---

## 🧪 Testing the Flow

### Test Steps:
1. List shares for sale (Account A)
2. Buy the listing (Account B)
3. **Verify Database:**
   ```sql
   -- Check listing status
   SELECT * FROM marketplace_listings WHERE listing_id = 1;
   -- Should show status = 'SOLD'
   
   -- Check buyer portfolio
   SELECT * FROM user_portfolio 
   WHERE wallet_address = 'account_b' AND token_id = 1;
   -- Should show increased shares_owned
   
   -- Check transaction history
   SELECT * FROM marketplace_transactions 
   WHERE listing_id = 1;
   -- Should have 1 record with all details
   ```

4. **Verify UI:**
   - Account B dashboard shows new shares
   - Account A "My Listings" section cleared
   - Marketplace page doesn't show the listing

---

## 🚀 Future Enhancements

### Trade History Page
Could create `/marketplace/history` showing:
- User's buying history
- User's selling history
- Price charts over time
- Total volume traded

### Analytics Dashboard
- Total marketplace volume
- Most traded properties
- Average price trends
- Active traders

### Notifications
- Email/push when shares are sold
- Price alerts for properties
- New listing notifications

---

## 📝 Summary

✅ **Complete database integration implemented**
- Purchases recorded in database
- Portfolio automatically updated
- Trade history tracked
- Status transitions handled
- Error-resistant (blockchain is primary source)

✅ **User experience enhanced**
- Clear status messages
- Automatic UI updates
- Portfolio sync
- Transaction history

✅ **Data integrity maintained**
- Blockchain remains source of truth
- Database is secondary for UX
- Graceful error handling
- Proper indexing for performance

**The marketplace now has complete end-to-end purchase tracking! 🎉**
