# KYC SBT User Notification System

## Overview
After admin approves KYC, users can now see their Soulbound Token (SBT) in their dashboard.

## What Was Added

### 1. KYC Status Badge Component
**Location:** `frontend/components/dashboard/KYCStatusBadge.tsx`

**Features:**
- ✅ Shows beautiful green badge when SBT is minted
- ✅ Displays SBT Token ID
- ✅ Shows verification date
- ✅ Expandable details section explaining what SBT is
- ✅ Links to:
  - Arbiscan (view token on blockchain explorer)
  - IPFS Gateway (view metadata)
  - Internal explorer page
- ✅ Shows non-transferable notice
- ✅ Displays ZK-proof hash

### 2. Dashboard Integration
**Location:** `frontend/components/dashboard/DashboardContent.tsx`

The badge automatically appears in the dashboard when user has an SBT.

## User Flow

### When KYC is Approved by Admin:

1. **Admin Side:**
   - Admin approves KYC from admin panel
   - System generates ZK-proof hash
   - Submits proof to ZKRegistry contract
   - Creates SBT metadata and uploads to IPFS
   - Mints SBT to user's wallet
   - Updates database with:
     - `sbt_token_id`
     - `sbt_metadata_cid`
     - `proof_hash`
     - `verified_at`

2. **User Side:**
   - User visits dashboard
   - Sees green "KYC Verified ✓" badge with SBT icon
   - Badge shows:
     - Token ID number
     - Verification date
     - "SOULBOUND TOKEN" label
   - User can click to expand details
   - Details show:
     - Explanation of what SBT is
     - ZK-Proof hash
     - Links to view on Arbiscan
     - Link to view metadata on IPFS
     - Link to explorer page
     - Notice that token is non-transferable

## What is a Soulbound Token (SBT)?

**As shown to users:**
> A Soulbound Token (SBT) is a non-transferable NFT permanently bound to your wallet. 
> It serves as your verified identity proof on the blockchain. You cannot sell or transfer this token.

## Technical Details

### Environment Variables Used:
- `PINATA_JWT` - Server-side JWT for IPFS uploads (FIXED)
- `NEXT_PUBLIC_IDENTITY_SBT_ADDRESS` - Contract address for SBT
- `NEXT_PUBLIC_PINATA_GATEWAY` - IPFS gateway URL

### Contracts:
- **IdentitySBT**: `0x7390325CC470bd9831160e6F3803dc5755e7a922`
- **ZKRegistry**: `0x4c01b3A4724D85Bf5d4913D2bF40CEA27b59a7d7`
- **UserRegistry**: `0xf77951f62ED3B92d6c8db131aca2D7b822301Ee2`

### Database Fields (users table):
- `sbt_token_id` - Token ID number
- `sbt_metadata_cid` - IPFS CID of metadata
- `proof_hash` - ZK-proof hash
- `proof_tx_hash` - Transaction hash of proof submission
- `verified_at` - Timestamp of verification

## Links Generated:

1. **Arbiscan Link:**
   ```
   https://sepolia.arbiscan.io/token/{IdentitySBT_ADDRESS}?a={tokenId}
   ```

2. **IPFS Metadata:**
   ```
   https://gateway.pinata.cloud/ipfs/{metadataCID}
   ```

3. **Internal Explorer:**
   ```
   /explorer/{userAddress}
   ```

## Visual Design

The badge features:
- 🎨 Gradient green background (from-green-50 to-emerald-50)
- 🛡️ Shield icon with checkmark
- ✅ "KYC Verified" heading
- 🏷️ "SOULBOUND TOKEN" label
- 📊 Token ID and verification date
- 🔽 Expandable details section
- 🔗 Action buttons for external links
- 🔒 Non-transferable notice

## Issue Fixed

**Original Problem:**
- Environment variable was `NEXT_PUBLIC_PINATA_JWT` but API was looking for `PINATA_JWT`
- Server-side routes cannot access `NEXT_PUBLIC_*` variables

**Solution:**
- Added `PINATA_JWT` (without prefix) to `.env.local` for server-side use
- Kept `NEXT_PUBLIC_PINATA_JWT` for client-side use

## Testing

1. Admin approves KYC from `/admin/kyc`
2. User refreshes dashboard
3. Green badge appears showing SBT details
4. User can click to expand and see:
   - Full explanation
   - Links to blockchain explorer
   - IPFS metadata
   - Explorer page

## Next Steps (Optional Enhancements)

1. ✨ Add real-time notification when SBT is minted (WebSocket/polling)
2. 📧 Email notification to user when KYC approved
3. 🎉 Celebration animation when SBT first appears
4. 📱 Mobile-optimized badge display
5. 🔔 Browser notification API integration
6. 💬 In-app notification center
