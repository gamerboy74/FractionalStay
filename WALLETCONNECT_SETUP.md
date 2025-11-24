# WalletConnect Project ID Setup

## What is WalletConnect Project ID?

WalletConnect Project ID is required for the frontend to connect wallets (MetaMask, WalletConnect, etc.) via RainbowKit.

## How to Get WalletConnect Project ID (Free)

### Step 1: Go to WalletConnect Cloud
Visit: **https://cloud.walletconnect.com/**

### Step 2: Sign Up / Sign In
- Create a free account (or sign in if you have one)
- No credit card required

### Step 3: Create a New Project
1. Click "Create New Project" or "New Project"
2. Enter project name (e.g., "FractionalStay")
3. Select "Web" as the platform
4. Click "Create"

### Step 4: Copy Project ID
- After creating the project, you'll see your **Project ID**
- It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- Copy this ID

### Step 5: Add to Frontend
Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Quick Steps Summary

1. Visit: https://cloud.walletconnect.com/
2. Sign up (free)
3. Create new project
4. Copy Project ID
5. Add to `frontend/.env.local`

## Important Notes

- ✅ **Free** - No payment required
- ✅ Takes 2 minutes to set up
- ✅ One Project ID works for all environments
- ⚠️ Keep it secret (don't commit to public repos)
- ⚠️ Add to `.env.local` (already in .gitignore)

## Alternative: Using Without Project ID

If you want to test without WalletConnect initially, you can:
- Use MetaMask directly (RainbowKit will still work)
- Set a placeholder: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=placeholder`
- But some wallet connections may not work fully

## Where It's Used

The Project ID is used in:
- `frontend/lib/wagmi.ts` - Wagmi configuration
- RainbowKit wallet connection modal
- WalletConnect protocol connections

## Example .env.local

```env
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```






