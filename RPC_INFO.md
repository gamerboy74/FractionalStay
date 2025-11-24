# RPC URL Information

## Required: Arbitrum Sepolia RPC URL

You need an RPC endpoint for **Arbitrum Sepolia testnet**.

## Option 1: Free Public RPC (Quick Start)

```
https://sepolia-rollup.arbitrum.io/rpc
```

This is the official public RPC - works but may be rate-limited.

## Option 2: Alchemy (Recommended - Free Tier)

1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create new app
4. Select "Arbitrum" → "Sepolia"
5. Copy the HTTP URL
6. Format: `https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

## Option 3: Infura (Free Tier)

1. Go to https://www.infura.io/
2. Sign up (free)
3. Create new project
4. Select "Arbitrum Sepolia"
5. Copy the endpoint URL
6. Format: `https://arbitrum-sepolia.infura.io/v3/YOUR_PROJECT_ID`

## Option 4: QuickNode (Free Tier)

1. Go to https://www.quicknode.com/
2. Sign up
3. Create endpoint for Arbitrum Sepolia
4. Copy the HTTP URL

## Option 5: Your Own Node

If you're running your own Arbitrum Sepolia node:

```
http://localhost:8547
```

(Default Arbitrum Sepolia port)

## Where to Use

Add to `contracts/.env`:

```env
ARBITRUM_SEPOLIA_RPC_URL=https://your-rpc-url-here
```

Also add to `relayer-service/.env`:

```env
RPC_URL=https://your-rpc-url-here
```

## Quick Start (Public RPC)

If you just want to test quickly, use the public RPC:

```env
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

## Notes

- Free tiers usually have rate limits (but enough for testing)
- For production, consider paid plans
- Public RPC is fine for development/testing
- Keep your API keys secret (never commit to git)





