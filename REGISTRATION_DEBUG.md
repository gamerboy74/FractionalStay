# Registration Debugging Guide

## ✅ Recent Fixes (Nov 22, 2025):
1. ✅ Added auto-redirect for already registered users → Goes to /dashboard
2. ✅ Changed `writeContract` to `writeContractAsync` for proper async handling
3. ✅ Added error display in UI (red box shows transaction errors)
4. ✅ Added detailed logging for transaction submission
5. ✅ Added useUserRole check on page load

## ✅ Pre-checks Done:
1. ✅ Database connected (Supabase working)
2. ✅ Contract deployed (UserRegistry at 0x8732ea38Bb0cb8daC815A1CE4dafBE206a40D995)
3. ✅ Contract readable (tested successfully)
4. ✅ Schema created (users table exists)
5. ✅ API routes created (/api/users/register)

## 🔍 How to Debug Registration:

### Step 1: Open Browser Console
```
1. Go to http://localhost:3001/register
2. Press F12 to open DevTools
3. Go to "Console" tab
4. Clear all logs
```

### Step 2: Try Registration
```
1. Connect your wallet (MetaMask)
2. Select role (Investor or Seller)
3. Fill in:
   - Full Name
   - Email
   - Business Name (if Seller)
4. Click "Create Account"
```

### Step 3: Check Console Logs
You should see logs like:
```
✅ Starting registration: { role: 'CLIENT', name: '...', email: '...' }
✅ UserRegistry status: { address: '0x8732...', isDeployed: true }
✅ Calling registerAsClient: { name: '...', email: '...' }
```

## 🐛 Common Issues & Fixes:

### Issue 1: "Validation failed"
**Symptom:** Button doesn't do anything
**Fix:** Make sure all required fields are filled:
- Name must not be empty
- Email must not be empty
- Business Name must not be empty (for Seller)

### Issue 2: "Confirm in Wallet" never appears
**Symptom:** Button stays as "Create Account"
**Possible causes:**
1. Wallet not connected → Check top-right corner
2. Wrong network → Switch to Arbitrum Sepolia
3. UserRegistry address wrong → Check console logs

**Fix:**
```
1. Disconnect wallet
2. Reconnect wallet
3. Switch to Arbitrum Sepolia network
4. Try again
```

### Issue 3: MetaMask shows error
**Common errors:**
- "User rejected" → You clicked Reject, click Confirm instead
- "Insufficient funds" → You need some ETH for gas
- "Execution reverted" → Check if you're already registered

**Fix for "Already registered":**
```
// You're probably already registered!
// Go directly to: http://localhost:3001/kyc
```

### Issue 4: Transaction confirmed but doesn't redirect
**Symptom:** Green "Registration Successful!" appears but doesn't redirect
**Expected:** Should redirect to /kyc after 2 seconds
**Fix:** Manually navigate to http://localhost:3001/kyc

### Issue 5: Database save fails
**Symptom:** Console shows "Failed to save user to database"
**Fix:** Check Supabase credentials in .env.local

## 🎯 Expected Flow:

```
1. Fill form
   ↓
2. Click "Create Account"
   ↓
3. Button shows "Confirm in Wallet..."
   ↓
4. MetaMask popup appears
   ↓
5. Click "Confirm" in MetaMask
   ↓
6. Button shows "Registering on Blockchain..."
   ↓
7. Wait for transaction (5-10 seconds)
   ↓
8. Button shows "Saving to Database..."
   ↓
9. Database save completes
   ↓
10. Green success message appears
   ↓
11. Redirects to /kyc after 2 seconds
```

## 📝 Manual Check:

### Check if user exists in contract:
```bash
cd frontend
node test-contract.js
# Should show your wallet address and role
```

### Check if user exists in database:
```javascript
// Open browser console on http://localhost:3001
const response = await fetch('/api/users/YOUR_WALLET_ADDRESS');
const data = await response.json();
console.log(data);
// Should show { exists: true, user: {...} }
```

## 🚨 Quick Fixes:

### If NOTHING works:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart dev server:
   ```powershell
   # Stop current server (Ctrl+C)
   cd C:\Users\gboy3\OneDrive\Documents\FractionalEstate\frontend
   npm run dev
   ```
3. Try in Incognito/Private mode
4. Try different wallet address

### If wallet popup doesn't appear:
1. Open MetaMask manually
2. Check if there's a pending transaction
3. If stuck, click "Cancel All"
4. Try registration again

### If gas error:
Get testnet ETH from:
- https://faucet.quicknode.com/arbitrum/sepolia
- https://www.alchemy.com/faucets/arbitrum-sepolia

### If already registered:
```javascript
// Check current status in console
const { useAccount } = await import('wagmi');
// Your address is already registered!
// Go to /kyc to continue
```

## ✅ Success Indicators:

You know it worked when:
1. ✅ MetaMask showed transaction popup
2. ✅ Transaction confirmed (green checkmark in MetaMask)
3. ✅ Console shows "User saved to database"
4. ✅ Green success message on page
5. ✅ Redirects to /kyc page

---

**Still not working? Share the exact error message from browser console!**
