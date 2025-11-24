# Quick Setup Guide

## Step 1: Configure Contracts

Create `contracts/.env` file:
```env
ARBITRUM_SEPOLIA_RPC_URL=your_rpc_url_here
PRIVATE_KEY=your_private_key_here
USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58cE45e4C8
ARBISCAN_API_KEY=your_arbiscan_key_optional
```

## Step 2: Deploy Contracts

```bash
cd contracts
npm run deploy:sepolia
npm run setup
```

After deployment, copy the addresses from `contracts/deployments.json`

## Step 3: Configure Frontend

Create `frontend/.env.local` file:
```env
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=<from deployments.json>
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=<from deployments.json>
NEXT_PUBLIC_MARKETPLACE_ADDRESS=<from deployments.json>
NEXT_PUBLIC_GOVERNANCE_ADDRESS=<from deployments.json>
NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58cE45e4C8
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

Get WalletConnect Project ID from: https://cloud.walletconnect.com

## Step 4: Configure Relayer Service

Create `relayer-service/.env` file:
```env
RPC_URL=your_rpc_url_here
PRIVATE_KEY=relayer_wallet_private_key
USDC_ADDRESS=<from deployments.json>
REVENUE_SPLITTER_ADDRESS=<from deployments.json>
INTERVAL_SECONDS=0
PROPERTIES=[{"tokenId":1,"amount":1000}]
```

## Step 5: Run Everything

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Run Relayer (when needed):
```bash
cd relayer-service
npm start 1 1000  # Manual: property 1, 1000 USDC
```

## Quick Commands

```bash
# Deploy contracts
cd contracts && npm run deploy:sepolia && npm run setup

# Start frontend
cd frontend && npm run dev

# Build relayer
cd relayer-service && npm run build
```






