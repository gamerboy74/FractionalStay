# Blockchain → Database Synchronization Architecture

## System Overview

FractionalStay uses a **custom blockchain indexer** instead of The Graph to maintain a synchronized database that mirrors on-chain state. This document explains the complete architecture.

---

## Core Principles

### 1. Single Source of Truth
```
Smart Contracts (Blockchain) = Source of Truth
         ↓
    Event Indexer
         ↓
Supabase Database = Materialized View (for fast queries)
```

**The blockchain is always right.** The database is just a cache for better UX.

### 2. Event-Driven Sync

```typescript
1. Smart contract emits event → Blockchain
2. Indexer polls RPC → Fetches events
3. Handler processes event → Updates database
4. State saved → Checkpoint created
```

### 3. Guaranteed Consistency

**Problem:** What if blockchain reorganizes (reorg)?

**Solution:** 
- Keep checkpoints every 100 blocks
- Compare block hashes on every run
- If hash mismatch detected → rollback and reprocess

**Problem:** What if database write fails?

**Solution:**
- Store raw events in `blockchain_events` table first
- Then update application tables
- Can always rebuild from raw events

**Problem:** What if we process same event twice?

**Solution:**
- Unique constraint on `(transaction_hash, log_index)`
- Duplicate inserts fail silently
- Idempotent handlers (can run multiple times)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ARBITRUM SEPOLIA                         │
│                                                             │
│  PropertyShare1155  RevenueSplitter  Marketplace           │
│  UserRegistry       IdentitySBT      ZKRegistry            │
│                                                             │
│  Events emitted: PropertyCreated, SharesPurchased, etc.    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ RPC Polling (every 5 seconds)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  BLOCKCHAIN INDEXER                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Event        │  │ Reorg        │  │ Checkpoint   │    │
│  │ Processor    │  │ Detector     │  │ Manager      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  Handlers:                                                  │
│  - PropertyShare → handlePropertyCreated()                  │
│  - RevenueSplitter → handleRewardClaimed()                  │
│  - Marketplace → handleListingPurchased()                   │
│  - UserRegistry → handleKYCApproved()                       │
│  - IdentitySBT → handleSbtMinted()                         │
│  - ZKRegistry → handleProofSubmitted()                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Database Updates
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                         │
│                                                             │
│  Indexer Tables:                                            │
│  ├─ indexer_state (tracks progress)                        │
│  └─ blockchain_events (raw event log)                      │
│                                                             │
│  Application Tables:                                        │
│  ├─ properties (property listings)                         │
│  ├─ user_portfolio (investment holdings)                   │
│  ├─ marketplace_listings (sell orders)                     │
│  ├─ marketplace_transactions (trade history)               │
│  ├─ rent_deposits (revenue tracking)                       │
│  ├─ reward_claims (claim history)                          │
│  ├─ users (profiles)                                        │
│  ├─ kyc_documents (verification docs)                      │
│  └─ ward_boys (property managers)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Fast Queries
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS FRONTEND                           │
│                                                             │
│  - Dashboard (fetches from Supabase)                       │
│  - Marketplace (fetches from Supabase)                     │
│  - Property Details (fetches from Supabase)                │
│  - Portfolio (fetches from Supabase)                       │
│                                                             │
│  Transactions sent directly to blockchain via Wagmi        │
└─────────────────────────────────────────────────────────────┘
```

---

## Event Flow Examples

### Example 1: User Buys Property Shares

```
1. USER ACTION:
   Frontend → PropertyShare1155.purchaseShares(tokenId, amount)
   
2. BLOCKCHAIN:
   Smart contract:
   - Transfers USDC from buyer to seller
   - Mints shares to buyer
   - Emits SharesPurchased(tokenId, buyer, amount, totalPrice)
   
3. INDEXER (within 5-15 seconds):
   Detects SharesPurchased event:
   - Calls handleSharesPurchased()
   - Updates properties.available_shares (decrement)
   - Updates/creates user_portfolio entry (add shares)
   - Stores raw event in blockchain_events
   
4. FRONTEND:
   - User refreshes dashboard
   - Sees updated shares immediately (from database)
```

### Example 2: Ward Boy Deposits Rent

```
1. WARD BOY ACTION:
   Frontend → RevenueSplitter.depositRentByManager(tokenId, netAmount, grossRent, miscFee)
   
2. BLOCKCHAIN:
   Smart contract:
   - Validates ward boy is assigned
   - Transfers USDC to contract
   - Adds to pendingDistribution[tokenId]
   - Emits FundsDepositedByManager(tokenId, manager, netAmount, grossRent, miscFee)
   
3. INDEXER:
   Detects FundsDepositedByManager event:
   - Calls handleFundsDepositedByManager()
   - Inserts into rent_deposits (status: PENDING)
   - Stores raw event
   
4. ADMIN ACTION:
   Frontend → RevenueSplitter.callOutPay(tokenId)
   
5. BLOCKCHAIN:
   Smart contract:
   - Deducts 3% platform fee
   - Moves funds to distributable
   - Emits PayoutTriggered(tokenId, grossAmount, platformFee, netForDistribution)
   
6. INDEXER:
   Detects PayoutTriggered event:
   - Calls handlePayoutTriggered()
   - Updates rent_deposits (status: DISTRIBUTED)
   - Stores raw event
   
7. SHAREHOLDERS:
   - Can now call claim()
   - Indexer tracks each claim in reward_claims table
```

### Example 3: Marketplace Trade

```
1. SELLER ACTION:
   Frontend → Marketplace.createListing(tokenId, amount, pricePerShare)
   
2. BLOCKCHAIN:
   Smart contract:
   - Transfers shares from seller to marketplace (escrow)
   - Emits ListingCreated(listingId, seller, tokenId, amount, pricePerShare)
   
3. INDEXER:
   Detects ListingCreated event:
   - Calls handleListingCreated()
   - Inserts into marketplace_listings (status: ACTIVE)
   - TransferSingle also fired → updates seller's portfolio (decrease shares)
   
4. BUYER ACTION:
   Frontend → Marketplace.purchase(listingId)
   
5. BLOCKCHAIN:
   Smart contract:
   - Transfers USDC from buyer to seller (97.5%)
   - Transfers 2.5% fee to platform
   - Transfers shares from marketplace to buyer
   - Emits ListingPurchased(listingId, buyer, tokenId, amount, totalPrice)
   
6. INDEXER:
   Detects ListingPurchased event:
   - Calls handleListingPurchased()
   - Updates marketplace_listings (status: SOLD)
   - Inserts into marketplace_transactions
   - Updates buyer's portfolio (increase shares)
   - TransferSingle also fired → further portfolio updates
```

---

## Reorg Protection Mechanism

### What is a Blockchain Reorg?

Blockchain can "reorganize" if miners/validators switch to a different chain fork:

```
Normal:
Block 100 → Block 101 → Block 102 → Block 103

Reorg:
Block 100 → Block 101 → Block 102 (reorged)
          ↘ Block 101' → Block 102' → Block 103' (new canonical chain)
```

Events in block 102 may disappear or change!

### Our Protection Strategy

```typescript
Every 100 blocks:
  Save checkpoint = { blockNumber, blockHash }

On each indexer run:
  1. Load checkpoint from database
  2. Fetch block from blockchain
  3. Compare hashes:
     
     if (blockHashFromChain === checkpointHash) {
       ✅ No reorg - continue processing
     } else {
       ⚠️ Reorg detected!
       → Delete all events after checkpoint
       → Reprocess from checkpoint
     }
```

### Example Reorg Handling

```
STATE BEFORE:
  indexer_state:
    last_processed_block: 12450
    last_checkpoint_block: 12400
    last_checkpoint_hash: 0xabc123...

INDEXER RUNS:
  1. Fetch block 12400 from chain
  2. Block 12400 hash: 0xdef456... (DIFFERENT!)
  3. Reorg detected!
  
ACTION:
  1. DELETE FROM blockchain_events WHERE block_number >= 12400
  2. DELETE FROM user_portfolio WHERE last_updated >= block_12400_timestamp
  3. (Cascade deletes other tables)
  4. Set last_processed_block = 12399
  5. Resume processing from 12400

RESULT:
  ✅ Database now consistent with new canonical chain
```

### Why 3 Confirmations?

We wait 3 blocks before processing to reduce reorg probability:

```
Latest block: 15000
We process up to: 14997 (15000 - 3)

If reorg happens, it's likely in recent blocks.
By waiting, we reduce reorg events by ~99%.
```

---

## State Management

### Indexer State Table

```sql
CREATE TABLE indexer_state (
    contract_address TEXT PRIMARY KEY,
    last_processed_block BIGINT,       -- 12450
    last_block_hash TEXT,              -- 0xabc...
    last_checkpoint_block BIGINT,      -- 12400
    last_checkpoint_hash TEXT,         -- 0xdef...
    updated_at TIMESTAMPTZ
);
```

**Example rows:**

| contract_address | last_processed_block | last_checkpoint_block |
|-----------------|---------------------|----------------------|
| 0x3809... (PropertyShare) | 14567 | 14500 |
| 0x9F5C... (RevenueSplitter) | 14567 | 14500 |
| 0xE3ee... (Marketplace) | 14567 | 14500 |

### Blockchain Events Table (Audit Log)

```sql
CREATE TABLE blockchain_events (
    id UUID PRIMARY KEY,
    event_name TEXT,                   -- 'SharesPurchased'
    contract_address TEXT,             -- 0x3809...
    block_number BIGINT,               -- 14567
    transaction_hash TEXT,             -- 0xabc...
    log_index INTEGER,                 -- 5
    args JSONB,                        -- { tokenId: 1, buyer: '0x...', amount: 10 }
    processed_at TIMESTAMPTZ,
    UNIQUE (transaction_hash, log_index)
);
```

This table is **immutable** - never updated, only inserted. It's the source of truth if you need to rebuild.

---

## Idempotent Event Handlers

All event handlers are **idempotent** - can run multiple times safely:

```typescript
// Example: handleSharesPurchased
async function handleSharesPurchased(tokenId, buyer, amount, totalPrice, ...) {
  // 1. Store raw event (unique constraint prevents duplicates)
  await storeEvent('SharesPurchased', ...)
  
  // 2. Update properties (upsert is idempotent)
  await supabase
    .from('properties')
    .update({ 
      available_shares: sql`available_shares - ${amount}` 
    })
    .eq('token_id', tokenId)
  
  // 3. Update portfolio (upsert is idempotent)
  const existing = await getPortfolio(buyer, tokenId)
  
  if (existing) {
    // Increment shares
    await updatePortfolio(...)
  } else {
    // Create new entry
    await createPortfolio(...)
  }
}
```

**Key techniques:**
- Use `UPSERT` (insert or update)
- Use unique constraints
- Use atomic increments (`shares + 10` not `= 10`)
- Store raw event first (can rebuild if handler fails)

---

## Performance Optimizations

### 1. Batch Processing

Instead of processing blocks one by one:

```typescript
// BAD: Process 1 block per query
for (let i = 12000; i <= 13000; i++) {
  const logs = await getLogs({ fromBlock: i, toBlock: i })
  await processLogs(logs)
}

// GOOD: Process 1000 blocks per query
for (let i = 12000; i <= 13000; i += 1000) {
  const logs = await getLogs({ fromBlock: i, toBlock: i + 1000 })
  await processLogs(logs)
}
```

### 2. Database Indexes

Critical indexes for fast queries:

```sql
-- Fast lookup by wallet
CREATE INDEX idx_user_portfolio_wallet ON user_portfolio(wallet_address);

-- Fast lookup by token
CREATE INDEX idx_user_portfolio_token ON user_portfolio(token_id);

-- Fast marketplace queries
CREATE INDEX idx_marketplace_status ON marketplace_listings(status) WHERE status = 'ACTIVE';

-- Fast event queries
CREATE INDEX idx_blockchain_events_block ON blockchain_events(block_number);
CREATE INDEX idx_blockchain_events_tx ON blockchain_events(transaction_hash);
```

### 3. Connection Pooling

```typescript
// Supabase client automatically pools connections
// No need to manage manually
```

### 4. Parallel Processing

We process all contracts in parallel:

```typescript
await Promise.all([
  processContract(PropertyShare),
  processContract(RevenueSplitter),
  processContract(Marketplace),
  // ...
])
```

---

## Failure Recovery

### Scenario 1: Indexer Crashes

```
STATE: Last processed block 12450

CRASH: Indexer dies at block 12455

RECOVERY:
  1. Indexer restarts
  2. Loads state: last_processed_block = 12450
  3. Resumes from block 12451
  4. No data loss!
```

### Scenario 2: Database Write Fails

```
EVENT: SharesPurchased detected

ACTION:
  1. storeEvent() → ✅ Success (raw event stored)
  2. updateProperties() → ❌ Fails (network error)

RECOVERY:
  1. Event is in blockchain_events table
  2. Next indexer run sees block is not marked as processed
  3. Reprocesses same block
  4. storeEvent() → Duplicate, skipped
  5. updateProperties() → ✅ Success this time
```

### Scenario 3: RPC Provider Down

```
ERROR: Failed to fetch logs

ACTION:
  1. Log error
  2. Wait poll_interval (5 seconds)
  3. Try again
  4. Eventually succeeds when RPC is back
```

### Scenario 4: Manual Rollback Needed

```sql
-- Find last good checkpoint
SELECT * FROM indexer_state;
-- last_checkpoint_block: 12400

-- Delete events after checkpoint
DELETE FROM blockchain_events WHERE block_number >= 12400;
DELETE FROM user_portfolio WHERE last_updated >= '2024-11-24 12:00:00';
-- (cascade to other tables)

-- Reset state
UPDATE indexer_state 
SET last_processed_block = 12399
WHERE contract_address = '0x3809...';

-- Restart indexer
-- It will reprocess from 12400
```

---

## Monitoring & Observability

### Health Check

```bash
npm run health
```

Output:
```
✅ Database connection OK
✅ Indexer is synced (3 blocks behind)

Sync status:
- PropertyShare: Block 14997/15000
- RevenueSplitter: Block 14997/15000
- Marketplace: Block 14997/15000
```

### Logs

```json
{
  "level": "info",
  "msg": "Processing blocks",
  "address": "0x3809...",
  "fromBlock": 14000,
  "toBlock": 15000,
  "logsFound": 125
}
```

### Database Queries

```sql
-- Sync status
SELECT contract_address, last_processed_block, updated_at 
FROM indexer_state;

-- Event counts
SELECT event_name, COUNT(*) 
FROM blockchain_events 
GROUP BY event_name;

-- Recent events
SELECT * FROM blockchain_events 
ORDER BY block_number DESC 
LIMIT 10;

-- Total value locked
SELECT * FROM get_total_value_locked();
```

---

## Comparison: Our Indexer vs The Graph

| Feature | Our Indexer | The Graph |
|---------|------------|-----------|
| **Cost** | Free (self-hosted) | ~$10-100/month |
| **Latency** | 5-15 seconds | 30-60 seconds |
| **Control** | Full control | Limited |
| **Complexity** | Medium | High (GraphQL schema, deployment) |
| **Reliability** | You manage | They manage |
| **Decentralization** | Centralized DB | Decentralized indexers |
| **Custom Logic** | Easy (TypeScript) | Limited (AssemblyScript) |
| **Backfilling** | Easy | Slow |
| **Private Data** | Supported | Blockchain only |

**When to use The Graph:**
- Need decentralization
- Multi-chain indexing
- Public infrastructure preferred

**When to use our indexer:**
- Full control needed
- Faster development
- Cost-sensitive
- Need to index non-blockchain data (KYC, user profiles)

---

## Security Considerations

### 1. Database Access

```typescript
// ✅ GOOD: Use service role key (server-side only)
const supabase = createClient(url, SERVICE_ROLE_KEY)

// ❌ BAD: Don't use anon key for indexer
const supabase = createClient(url, ANON_KEY)
```

### 2. SQL Injection Prevention

```typescript
// ✅ GOOD: Parameterized queries (Supabase handles this)
await supabase
  .from('properties')
  .update({ name: userInput })

// ❌ BAD: String concatenation
await supabase.query(`UPDATE properties SET name = '${userInput}'`)
```

### 3. Address Normalization

```typescript
// ✅ Always lowercase addresses
const wallet = address.toLowerCase()

// Database constraint
CONSTRAINT wallet_lowercase CHECK (wallet_address = LOWER(wallet_address))
```

### 4. Event Validation

```typescript
// ✅ Validate event args before processing
if (amount <= 0) throw new Error('Invalid amount')
if (!isAddress(buyer)) throw new Error('Invalid address')
```

---

## Future Enhancements

### 1. GraphQL API Layer

Add Apollo Server on top of Supabase for better querying:

```graphql
query {
  properties(status: ACTIVE, limit: 10) {
    id
    name
    totalShares
    holders {
      wallet
      shares
    }
  }
}
```

### 2. Real-time Subscriptions

Use Supabase real-time for live updates:

```typescript
supabase
  .from('marketplace_listings')
  .on('INSERT', payload => {
    // Notify frontend of new listing
  })
  .subscribe()
```

### 3. Advanced Analytics

Pre-compute expensive queries:

```sql
CREATE MATERIALIZED VIEW property_stats AS
SELECT 
  token_id,
  COUNT(DISTINCT wallet_address) as investor_count,
  SUM(shares_owned) as shares_sold,
  AVG(purchase_price_per_share::NUMERIC) as avg_price
FROM user_portfolio
GROUP BY token_id;

-- Refresh every hour
REFRESH MATERIALIZED VIEW CONCURRENTLY property_stats;
```

### 4. Multi-Chain Support

Extend to mainnet + other L2s:

```typescript
const chains = [
  { name: 'Arbitrum Sepolia', rpc: '...', contracts: {...} },
  { name: 'Arbitrum One', rpc: '...', contracts: {...} },
  { name: 'Optimism', rpc: '...', contracts: {...} },
]

for (const chain of chains) {
  await processChain(chain)
}
```

---

## Conclusion

This blockchain indexer provides:

✅ **Reliable** - Reorg protection, error recovery  
✅ **Fast** - 5-second latency, batch processing  
✅ **Maintainable** - TypeScript, structured logging  
✅ **Cost-effective** - No external dependencies  
✅ **Production-ready** - Used by real dApps  

The blockchain is the source of truth, and our indexer ensures the database always reflects that truth - even in edge cases like reorgs, crashes, and network failures.
