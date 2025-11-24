# 📋 Deployment Checklist

## Pre-Deployment

- [ ] Node.js 18+ installed
- [ ] All dependencies installed (`npm run install:all` or install in each directory)
- [ ] Have Arbitrum Sepolia RPC URL ready
- [ ] Have deployer wallet with testnet ETH
- [ ] Have relayer wallet with testnet ETH and USDC
- [ ] Get WalletConnect Project ID from https://cloud.walletconnect.com

## Step 1: Configure Contracts

- [ ] Create `contracts/.env` with:
  - [ ] `ARBITRUM_SEPOLIA_RPC_URL` (your RPC)
  - [ ] `PRIVATE_KEY` (deployer wallet, no 0x prefix)
  - [ ] `USDC_ADDRESS` (Arbitrum Sepolia USDC)
  - [ ] `ARBISCAN_API_KEY` (optional)

Or run: `npm run setup`

## Step 2: Deploy Contracts

```bash
cd contracts
npm run deploy:sepolia
npm run setup
```

- [ ] Contracts deployed successfully
- [ ] Check `contracts/deployments.json` exists
- [ ] Note all contract addresses

## Step 3: Update Environment Files

```bash
npm run update-addresses
```

- [ ] Frontend `.env.local` updated
- [ ] Relayer `.env` updated
- [ ] All addresses match deployments.json

## Step 4: Configure Frontend

- [ ] Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to `frontend/.env.local`
- [ ] Verify all contract addresses are set

## Step 5: Configure Relayer

- [ ] Add relayer wallet `PRIVATE_KEY` to `relayer-service/.env`
- [ ] Verify `RPC_URL` is set
- [ ] Verify `USDC_ADDRESS` and `REVENUE_SPLITTER_ADDRESS` are set

## Step 6: Test

- [ ] Start frontend: `npm run dev:frontend`
- [ ] Connect wallet on http://localhost:3000
- [ ] Verify properties load (if any created)
- [ ] Test relayer: `cd relayer-service && npm start 1 1000`

## Contract Addresses Reference

After deployment, addresses are in:
- `contracts/deployments.json`
- `frontend/.env.local`
- `relayer-service/.env`

## Troubleshooting

### Contracts won't deploy
- Check RPC URL is correct
- Verify wallet has enough ETH
- Check private key format (no 0x prefix)

### Frontend shows zero addresses
- Run `npm run update-addresses`
- Check `frontend/.env.local` exists
- Verify contract addresses in deployments.json

### Relayer fails
- Check USDC balance in relayer wallet
- Verify contract addresses are correct
- Check RPC URL

## Quick Commands Reference

```bash
# Setup everything
npm run setup

# Deploy + update addresses
npm run deploy

# Just update addresses
npm run update-addresses

# Start frontend
npm run dev:frontend

# Build relayer
npm run build:relayer
```






