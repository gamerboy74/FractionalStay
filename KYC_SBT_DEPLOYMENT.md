# KYC SBT Badge Deployment Complete ✅

**Deployment Date:** November 24, 2025  
**Status:** Successfully Deployed to IPFS

## 📦 What Was Deployed

### 1. **KYC Verification Badge Image**
- **File:** `frontend/public/kyc-sbt-badge.svg`
- **Type:** SVG (Scalable Vector Graphics)
- **IPFS Hash:** `QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK`
- **IPFS URL:** `ipfs://QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK`
- **Gateway URL:** https://gateway.pinata.cloud/ipfs/QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK

**Design Features:**
- Purple/violet gradient background (FractionalStay brand colors)
- Golden shield with glow effects
- Green checkmark icon (verification symbol)
- "FractionalStay" branding
- "KYC VERIFIED" text
- "Identity Badge" subtitle
- "ON-CHAIN VERIFIED" blockchain badge
- Professional corner accents and sparkle effects
- 800x800px resolution

### 2. **Metadata Template (Reference)**
- **File:** `frontend/public/kyc-sbt-metadata-template.json`
- **Purpose:** Template showing metadata structure
- **IPFS Hash:** `QmeZ1dfgrYDpKVWKt1xSsBNi32HBtAGUSS8jSK1hG2Xi52`
- **Note:** Each user gets unique metadata with this image

### 3. **Upload Script**
- **File:** `frontend/scripts/upload-kyc-sbt-to-ipfs.js`
- **Purpose:** Automated IPFS upload tool
- **Dependencies:** axios, form-data, dotenv
- **Status:** Working and tested

## 🔧 Integration

### KYC Approval API Updated
**File:** `frontend/app/api/admin/kyc/approve/route.ts`

**Changes Made:**
- Updated image IPFS hash to use new standardized badge
- Aligned metadata structure with deployed template
- Enhanced attributes with complete badge information

**New Metadata Structure:**
```json
{
  "name": "FractionalStay Identity Badge",
  "description": "Verified KYC Identity - Soulbound Token (Non-Transferable)",
  "image": "ipfs://QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK",
  "attributes": [
    { "trait_type": "Verification Status", "value": "KYC Approved" },
    { "trait_type": "Badge Type", "value": "Identity SBT" },
    { "trait_type": "Platform", "value": "FractionalStay" },
    { "trait_type": "Blockchain", "value": "Arbitrum Sepolia" },
    { "trait_type": "Transferable", "value": "No" },
    { "trait_type": "Verification Provider", "value": "..." },
    { "trait_type": "Verified At", "value": "..." },
    { "trait_type": "Proof Hash", "value": "..." }
  ],
  "properties": {
    "category": "Identity",
    "type": "Soulbound Token",
    "verified": true,
    "issued_by": "FractionalStay Platform"
  }
}
```

## 🚀 How It Works

### Workflow:
1. **User Submits KYC** → Uploads documents via dashboard
2. **Admin Reviews** → Checks documents in admin panel
3. **Admin Approves** → Clicks "Approve KYC" button
4. **Automated Process:**
   - ✅ Generates ZK proof hash
   - ✅ Creates personalized metadata JSON
   - ✅ Uploads metadata to IPFS (with standardized image)
   - ✅ Mints SBT to user's wallet
   - ✅ Submits proof to ZKRegistry contract
   - ✅ Updates database with all transaction hashes

### User Receives:
- **Soulbound Token (SBT)** in their wallet
- **Non-transferable** identity badge
- **Verified status** on platform
- **Access** to investment features

## 📊 IPFS Hashes Reference

Saved in: `frontend/kyc-sbt-ipfs-hashes.json`

```json
{
  "imageHash": "QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK",
  "metadataHash": "QmeZ1dfgrYDpKVWKt1xSsBNi32HBtAGUSS8jSK1hG2Xi52",
  "imageUrl": "ipfs://QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK",
  "metadataUrl": "ipfs://QmeZ1dfgrYDpKVWKt1xSsBNi32HBtAGUSS8jSK1hG2Xi52",
  "gatewayUrls": {
    "image": "https://gateway.pinata.cloud/ipfs/QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK",
    "metadata": "https://gateway.pinata.cloud/ipfs/QmeZ1dfgrYDpKVWKt1xSsBNi32HBtAGUSS8jSK1hG2Xi52"
  }
}
```

## 🔐 Smart Contract Integration

### IdentitySBT Contract
- **Address:** `0x7390325CC470bd9831160e6F3803dc5755e7a922`
- **Network:** Arbitrum Sepolia
- **Type:** ERC721 Soulbound Token
- **Features:**
  - Non-transferable (soulbound)
  - One token per address
  - Stores metadata URI (IPFS)
  - Only owner (deployer) can mint

### Minting Process:
```typescript
mintSBT(userAddress, metadataURI)
// Returns: tokenId (incrementing)
// Stores: metadataURI for tokenId
// Prevents: transfers after minting
```

## 🧪 Testing Guide

### View Your Badge:
1. **Get SBT Token ID:**
   ```javascript
   const tokenId = await IdentitySBT.sbtOf(userAddress)
   ```

2. **Get Metadata URI:**
   ```javascript
   const metadataURI = await IdentitySBT.tokenURI(tokenId)
   ```

3. **View on IPFS Gateway:**
   - Replace `ipfs://` with `https://gateway.pinata.cloud/ipfs/`
   - Example: https://gateway.pinata.cloud/ipfs/QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK

### Test KYC Approval:
1. Login as admin (`0xac869c83abde601bb9a0379170fa7d51e7a47c55`)
2. Navigate to Admin Panel → KYC Management
3. Approve a pending KYC application
4. Check transaction hash in response
5. Verify SBT minted on Arbiscan
6. View badge image via IPFS gateway

## 📝 Environment Variables Used

```env
# From .env.local
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
NEXT_PUBLIC_IDENTITY_SBT_ADDRESS=0x7390325CC470bd9831160e6F3803dc5755e7a922
```

## 🎯 Next Steps

### Immediate:
- ✅ Badge deployed to IPFS
- ✅ KYC approval API updated
- ✅ Metadata structure standardized

### Future Enhancements:
- [ ] Add badge preview in dashboard
- [ ] Create badge gallery page
- [ ] Add OpenSea metadata compatibility
- [ ] Implement badge revocation mechanism
- [ ] Add batch minting for multiple approvals

## 🐛 Troubleshooting

### Issue: "IPFS image not loading"
**Solution:** Use Pinata gateway URL instead of public IPFS gateways
```
https://gateway.pinata.cloud/ipfs/QmbbBCcJWZsSG9aYBoKjgzqExHMeVriuywFwaKnWrojcpK
```

### Issue: "Metadata not updating"
**Solution:** Each user gets unique metadata uploaded dynamically. The image is the same for all users.

### Issue: "SBT not appearing in wallet"
**Solution:** 
1. Check if wallet supports ERC721 tokens
2. Manually add token: `0x7390325CC470bd9831160e6F3803dc5755e7a922`
3. View on blockchain explorer instead

### Issue: "Re-upload badge image"
**Solution:** Run the upload script again:
```bash
cd frontend
node scripts/upload-kyc-sbt-to-ipfs.js
```

## 📚 Resources

- **Pinata Dashboard:** https://pinata.cloud/
- **IPFS Documentation:** https://docs.ipfs.tech/
- **ERC721 Metadata Standard:** https://eips.ethereum.org/EIPS/eip-721
- **OpenSea Metadata Standards:** https://docs.opensea.io/docs/metadata-standards

## ✅ Deployment Verification

- [x] Badge image uploaded to IPFS
- [x] Metadata template created and uploaded
- [x] Upload script working correctly
- [x] KYC approval API updated
- [x] Image hash integrated in API
- [x] IPFS hashes saved for reference
- [x] Documentation created

---

**Deployed by:** GitHub Copilot  
**Verified by:** Automated testing  
**Status:** Production Ready ✅
