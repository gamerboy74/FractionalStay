REDEPLOY & Indexer Backfill — Quick Guide

This file describes the minimal steps to redeploy the updated `PropertyShare1155` contract and to run the indexer backfill so the database is reconciled with on-chain events.

Prerequisites
- Node.js (v18+ recommended)
- npm
- Environment variables configured (RPC URL, private keys, contract addresses, Supabase URL/keys)

1) Compile & Deploy Contracts (Hardhat)

From the `contracts` folder:

```powershell
cd contracts
npm install
npm run compile
# Deploy to Arbitrum Sepolia (adjust network if needed)
npm run deploy:sepolia
```

Notes:
- `deploy:sepolia` runs `hardhat run scripts/deploy.ts --network arbitrumSepolia` (see `contracts/package.json`).
- If you target a different network, change the `--network` argument accordingly.
- Ensure `.env` in `contracts/` contains the deployer private key and RPC URL (e.g. `PRIVATE_KEY`, `RPC_URL`).

2) Update Frontend & Backend Contract Addresses

- After deploy, copy the newly-deployed `PropertyShare1155` contract address from the Hardhat deploy output.
- Update the configuration where you store contract addresses (e.g., `frontend`, `indexer` and any other services):
  - `indexer/src/config.ts` -> `CONFIG.contracts.propertyShare`
  - `frontend` config files (e.g., `frontend/.env` or `frontend/next.config.js` depending on how you store addresses)

3) Run Indexer Backfill (replay historical events)

From the project root (or `indexer` folder):

```powershell
cd indexer
npm install
# Run a one-shot backfill that processes from the configured start block
npm run backfill
```

Notes on backfill behavior:
- The indexer respects `CONFIG.startBlock`, `CONFIG.batchSize` and `CONFIG.confirmationsRequired` in `indexer/src/config.ts`.
- If you need to backfill a specific range or re-run from genesis, adjust `CONFIG.startBlock` or use the `backfill.ts` script parameters (see `indexer/src/backfill.ts`).
- The indexer stores raw events in the database and then updates `properties`, `user_portfolios`, etc. It contains reorg protection — if you need to re-run a range, you may need to delete events after a block using the DB helper (or let the indexer handle rollbacks if a checkpoint exists).

4) Verify Results

- Use the indexer `health` script to confirm connectivity:

```powershell
cd indexer
npm run health
```

- Check Supabase tables:
  - `properties` should show correct `available_shares` and `total_shares`.
  - `user_portfolios` should contain entries for purchases.

5) Optional: Server-side tx verification endpoint (recommended)

Pattern:
- Frontend waits for tx confirmation and POSTs the tx hash to a backend `/verify-purchase` endpoint.
- Backend verifies the tx receipt via RPC, checks `SharesPurchased` event, and then runs the same DB updates (or enqueues a job to the indexer) to avoid trusting client values.

Example flow (pseudo):
- Frontend: wait for `tx.wait()` -> POST `/api/verify-purchase` { txHash }
- Backend: fetch receipt via RPC, verify event, update DB

If you'd like, I can scaffold a small Express endpoint that verifies tx receipts and calls the indexer handlers.

---

If you want, I can now:
- (A) Add a short Express endpoint that accepts tx hashes and verifies/persists purchases server-side; or
- (B) Create a short script to run an indexer backfill for a custom block range and backfill CLI args.

Which would you like next?