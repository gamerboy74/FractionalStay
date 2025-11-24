# 🚀 Quick Start Guide

## Option 1: Automated Setup (Recommended)

### Step 1: Run Setup Script
```bash
npm run setup
```
This will ask you for:
- RPC URL (you have this!)
- Private keys
- WalletConnect Project ID

### Step 2: Deploy Contracts
```bash
npm run deploy
```
This will:
- Deploy all contracts to Arbitrum Sepolia
- Automatically update frontend and relayer .env files with addresses

### Step 3: Start Frontend
```bash
npm run dev:frontend
```
Visit http://localhost:3000

---

## Option 2: Manual Setup

### 1. Contracts Setup
Create `contracts/.env`:
```env
ARBITRUM_SEPOLIA_RPC_URL=your_rpc_url_here
PRIVATE_KEY=your_deployer_private_key
USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58cE45e4C8
```

Deploy:
```bash
cd contracts
npm run deploy:sepolia
npm run setup
```

### 2. Update Addresses Automatically
```bash
npm run update-addresses
```
This reads `contracts/deployments.json` and updates frontend/relayer .env files.

### 3. Frontend Setup
Create `frontend/.env.local` (or let update-addresses script do it):
```env
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=<auto-filled>
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=<auto-filled>
NEXT_PUBLIC_MARKETPLACE_ADDRESS=<auto-filled>
NEXT_PUBLIC_GOVERNANCE_ADDRESS=<auto-filled>
NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58cE45e4C8
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
```

Get WalletConnect ID: https://cloud.walletconnect.com (free)

### 4. Relayer Setup
Create `relayer-service/.env`:
```env
RPC_URL=your_rpc_url_here
PRIVATE_KEY=relayer_wallet_private_key
USDC_ADDRESS=<auto-filled>
REVENUE_SPLITTER_ADDRESS=<auto-filled>
INTERVAL_SECONDS=0
```

---

## 🎯 After Setup

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Run Relayer (Manual):
```bash
cd relayer-service
npm start 1 1000  # Property 1, 1000 USDC
```

### Run Relayer (Auto):
Set `INTERVAL_SECONDS=3600` in relayer-service/.env for hourly deposits.

---

## 📝 Notes

- All contract addresses are saved in `contracts/deployments.json`
- Use `npm run update-addresses` anytime after redeployment
- Frontend runs on http://localhost:3000
- Make sure you have testnet ETH and USDC on Arbitrum Sepolia






