# Secondary Marketplace Testing Guide

## 🧪 How to Test the Secondary Marketplace

### Prerequisites
1. ✅ Frontend running: `npm run dev` in `/frontend`
2. ✅ Wallet connected (MetaMask/WalletConnect)
3. ✅ Some USDC in wallet
4. ✅ Own some property shares
5. ✅ Connected to Arbitrum Sepolia testnet

---

## Test Scenario 1: List Shares for Sale

### Steps:
1. **Go to Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Find a Property You Own**
   - Should see your portfolio with property cards
   - Each card shows shares owned

3. **Click "List for Sale"**
   - Form appears below the property
   - Enter number of shares (e.g., 5)
   - Enter price per share (e.g., 110)
   - See total listing value

4. **Approve Marketplace (First Time Only)**
   - Click "Approve Marketplace"
   - Confirm in wallet (gas fee in ETH)
   - Wait for confirmation
   - Button changes to "Create Listing"

5. **Create Listing**
   - Click "Create Listing"
   - Confirm transaction in wallet
   - Wait for confirmation
   - See "Syncing to database..." message
   - Success message appears

6. **Verify Listing Created**
   - Scroll down to "My Listings" section
   - Should see your listing with details
   - Go to `/marketplace` 
   - Should see your listing (marked "Your Listing")

### Expected Results:
✅ Listing appears in both Dashboard and Marketplace  
✅ Shares locked in escrow  
✅ Database updated with listing  
✅ Can't buy your own listing  

---

## Test Scenario 2: Buy Shares from Marketplace

### Steps:
1. **Go to Marketplace**
   ```
   http://localhost:3000/marketplace
   ```

2. **Browse Listings**
   - See all active listings (except yours)
   - View property details, price, shares

3. **Select a Listing to Buy**
   - Note the total price
   - Check you have enough USDC

4. **Approve USDC (First Time)**
   - Click "Approve USDC"
   - Confirm in wallet
   - Wait for confirmation

5. **Buy Now**
   - Click "Buy Now"
   - Confirm transaction
   - Wait for confirmation
   - Listing should disappear

6. **Verify Purchase**
   - Go to Dashboard
   - Should see the property in portfolio (or increased shares)
   - Seller should receive USDC (97.5% of price)

### Expected Results:
✅ USDC transferred from buyer to seller  
✅ Shares transferred to buyer  
✅ Listing removed from marketplace  
✅ 2.5% fee deducted from seller  
✅ Portfolio updated  

---

## Test Scenario 3: Cancel a Listing

### Steps:
1. **Go to Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Scroll to "My Listings"**
   - See all your active listings

3. **Click "Cancel Listing"**
   - Confirm transaction in wallet
   - Wait for confirmation

4. **Verify Cancellation**
   - Listing removed from "My Listings"
   - Go to `/marketplace` - listing should be gone
   - Shares returned to your wallet
   - Portfolio balance updated

### Expected Results:
✅ Listing removed from marketplace  
✅ Shares returned to seller  
✅ Database updated to CANCELLED  
✅ Can list same shares again  

---

## Test Scenario 4: Edge Cases

### Test 4a: Insufficient USDC
1. Try to buy with less USDC than required
2. Should see error: "Insufficient USDC balance"

### Test 4b: Not Approved
1. Try to buy without approving USDC
2. Should see: "Please approve USDC first"
3. Button should show "Approve USDC"

### Test 4c: List More Than You Own
1. Try to list more shares than balance
2. Input should be capped at max balance

### Test 4d: Buy Your Own Listing
1. Go to marketplace
2. Your listings should show "Your Listing" button (disabled)
3. Cannot buy your own shares

---

## 🔍 What to Check

### UI/UX Checks:
- [ ] Loading states show during transactions
- [ ] Success messages appear
- [ ] Error messages are clear
- [ ] Buttons disable during processing
- [ ] Property images load correctly
- [ ] Prices displayed correctly in USDC
- [ ] Fee transparency (2.5% shown)
- [ ] Responsive on mobile

### Smart Contract Checks:
- [ ] Shares escrowed in Marketplace contract
- [ ] Correct amounts transferred
- [ ] Fees deducted properly
- [ ] Listings auto-increment correctly
- [ ] Approvals work as expected

### Database Checks:
- [ ] Listings created in `marketplace_listings` table
- [ ] Status updated on cancel (CANCELLED)
- [ ] Timestamps updated correctly
- [ ] Joins with properties table work

---

## 🐛 Common Issues & Solutions

### Issue: "Approve Marketplace" not working
**Solution**: Check if PropertyShare1155 contract address is correct in `.env.local`

### Issue: "Approve USDC" not working
**Solution**: Check if USDC contract address is correct

### Issue: Listing not appearing in marketplace
**Solution**: 
1. Check database sync (console logs)
2. Verify listing status is ACTIVE
3. Check property status is ACTIVE

### Issue: Can't buy - insufficient balance
**Solution**: Get more USDC using faucet or mint script

### Issue: Transaction reverts
**Solution**: Check gas settings and wallet balance (ETH for gas)

---

## 📊 Success Criteria

All tests should pass:
- ✅ Can create listings
- ✅ Listings appear in marketplace
- ✅ Can buy from marketplace
- ✅ USDC approval works
- ✅ Can cancel listings
- ✅ Shares returned on cancel
- ✅ Fee calculation correct (2.5%)
- ✅ Database stays in sync
- ✅ Portfolio updates correctly
- ✅ Error handling works

---

## 🎯 Test with Multiple Accounts

### Setup:
1. Have 2+ wallets ready
2. Each wallet has USDC
3. Account A owns shares

### Test Flow:
```
Account A → Lists 10 shares for $110 each
Account B → Buys the listing
Account A → Receives $1,072.50 (97.5% of $1,100)
Account B → Receives 10 shares
```

---

## 🔧 Debugging Tools

### Browser Console:
```javascript
// Check listings in database
fetch('/api/marketplace/listings').then(r => r.json()).then(console.log)

// Check user portfolio
fetch('/api/users/YOUR_ADDRESS/portfolio').then(r => r.json()).then(console.log)
```

### Smart Contract Calls:
```javascript
// Check listing count
const count = await marketplaceContract.listingCount()

// Get listing details
const listing = await marketplaceContract.getListing(listingId)

// Check user balance
const balance = await propertyContract.balanceOf(address, tokenId)
```

---

## 📸 Screenshots to Take

1. ✅ Dashboard with "List for Sale" button
2. ✅ Create listing form
3. ✅ "My Listings" section
4. ✅ Marketplace page with listings
5. ✅ USDC approval flow
6. ✅ Purchase confirmation
7. ✅ Listing after cancellation

---

## ✅ Final Checklist

Before deploying to production:
- [ ] All test scenarios pass
- [ ] Edge cases handled
- [ ] Mobile responsive
- [ ] Error messages clear
- [ ] Loading states work
- [ ] Database sync confirmed
- [ ] Fee calculations correct
- [ ] No console errors
- [ ] Gas estimation reasonable
- [ ] Documentation updated

---

## 🚀 Ready to Test!

Start with **Test Scenario 1** and work through all scenarios. Document any issues found and verify they're resolved before moving forward.

**Happy Testing! 🎉**
