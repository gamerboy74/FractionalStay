# Fix: MetaMask RPC Error - "Failed to fetch"

## 🚨 Problem
MetaMask is using its default Arbitrum Sepolia RPC which is failing with "Failed to fetch" error.

## ✅ Solution: Add Custom Alchemy RPC to MetaMask

### Step-by-Step Fix:

1. **Open MetaMask Extension**

2. **Click Network Dropdown** (top left, shows "Arbitrum Sepolia")

3. **Settings → Networks → Arbitrum Sepolia**

4. **Edit Network Settings:**
   ```
   Network Name: Arbitrum Sepolia (Alchemy)
   
   RPC URL: https://arb-sepolia.g.alchemy.com/v2/_dehAHJ6i1FIe7mapiiDs
   
   Chain ID: 421614
   
   Currency Symbol: ETH
   
   Block Explorer: https://sepolia.arbiscan.io
   ```

5. **Save** and **Switch to this network**

6. **Verify Connection:**
   - MetaMask should show "Connected"
   - Green dot next to RPC URL
   - No error messages

### Alternative: Add as New Custom Network

If editing doesn't work, add as completely new network:

1. MetaMask → Settings → Networks → **Add Network**

2. **Add Network Manually:**
   ```
   Network Name: Arbitrum Sepolia Alchemy
   New RPC URL: https://arb-sepolia.g.alchemy.com/v2/_dehAHJ6i1FIe7mapiiDs
   Chain ID: 421614
   Currency Symbol: ETH
   Block Explorer URL: https://sepolia.arbiscan.io
   ```

3. **Save** → **Switch to Arbitrum Sepolia Alchemy**

4. **Test in Browser:**
   - Open browser console (F12)
   - Run: `window.ethereum.request({method: 'eth_chainId'})`
   - Should return: `"0x66eee"` (421614 in hex)

---

## 🔄 After Adding Custom RPC:

1. **Disconnect Wallet** from app
2. **Reconnect Wallet** (will use new RPC)
3. **Try Property Creation Again**

---

## 🎯 Why This Happens:

MetaMask has **built-in RPC endpoints** for popular networks. But:
- Arbitrum Sepolia is a testnet
- MetaMask's default RPC for it can be unreliable
- Your app's Alchemy RPC is much more stable
- But MetaMask **overrides** your app's RPC with its own

**Solution:** Force MetaMask to use your Alchemy RPC by adding it as custom network.

---

## ✅ Verification Checklist:

- [ ] Custom RPC added to MetaMask
- [ ] Green indicator showing RPC is connected
- [ ] Switched to custom network
- [ ] Wallet disconnected and reconnected in app
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Try property creation

---

## 🐛 If Still Fails:

Try these fallback RPCs (add them to MetaMask):

**Option 2: Public Arbitrum RPC**
```
RPC URL: https://sepolia-rollup.arbitrum.io/rpc
Chain ID: 421614
```

**Option 3: Alchemy Free Tier**
```
RPC URL: https://arb-sepolia.g.alchemy.com/v2/demo
Chain ID: 421614
```

---

## 📝 Quick Test Command:

In browser console (with MetaMask connected):

```javascript
// Test RPC connection
await window.ethereum.request({
  method: 'eth_blockNumber'
})
// Should return latest block number (hex)

// Test if RPC is working
await window.ethereum.request({
  method: 'eth_getBalance',
  params: ['0x8e1E7F06c9d62EDeB55ff9D9C45D3D8D97A905A6', 'latest']
})
// Should return your wallet balance
```

If these commands work, RPC is fine and you can proceed.

---

**Status:** MetaMask needs custom RPC configuration
**Solution:** Add Alchemy RPC manually to MetaMask network settings
**Next:** Test property creation after reconnecting wallet
