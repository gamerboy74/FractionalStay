# Contract Migration & Update Strategy

## Problem
When contracts are redeployed (bug fixes, upgrades, new features), existing user data in database becomes stale and points to old contract addresses.

## Solution Architecture

### 1. Contract Version Management
```
contracts/
  deployments.json          # Track all contract versions
  migrations/
    version-history.json    # Full deployment history with dates
```

### 2. Automated Migration Pipeline

#### A. Database Schema Enhancement
```sql
-- Add contract version tracking to users table
ALTER TABLE users ADD COLUMN contract_version TEXT DEFAULT 'v1.0';
ALTER TABLE kyc_documents ADD COLUMN contract_version TEXT DEFAULT 'v1.0';

-- Track contract migrations
CREATE TABLE contract_migrations (
  id SERIAL PRIMARY KEY,
  contract_name TEXT NOT NULL,
  old_address TEXT,
  new_address TEXT NOT NULL,
  migration_date TIMESTAMP DEFAULT NOW(),
  users_migrated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' -- pending, in_progress, completed, failed
);
```

#### B. Environment-Based Contract Resolution
```typescript
// lib/contracts.ts - Dynamic contract address resolution
export function getContractAddress(contractName: string): string {
  const deployments = require('../deployments.json');
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '421614';
  
  // Always use latest deployment
  return deployments[chainId][contractName];
}

// Automatically picks up new addresses from deployments.json
```

#### C. Migration Detection System
```typescript
// scripts/detect-migration-needed.ts
async function detectMigrationNeeded() {
  const latestContractAddress = getContractAddress('IdentitySBT');
  
  // Check if any users have old addresses
  const { data: outdatedUsers } = await supabase
    .from('kyc_documents')
    .select('wallet_address, contract_version')
    .neq('contract_version', CURRENT_VERSION);
  
  if (outdatedUsers?.length > 0) {
    console.log(`⚠️  ${outdatedUsers.length} users need migration`);
    // Trigger migration workflow
  }
}
```

### 3. Best Practices for Future Updates

#### ✅ DO THIS:
1. **Use deployments.json as single source of truth**
   - Frontend reads from deployments.json
   - Indexer reads from deployments.json
   - Scripts read from deployments.json

2. **Version everything**
   ```json
   {
     "421614": {
       "IdentitySBT": "0x6790...",
       "IdentitySBT_v1": "0x7390...",
       "version": "v2.0",
       "deployed_at": "2025-11-24T01:10:00Z"
     }
   }
   ```

3. **Run migration script after every contract update**
   ```bash
   # Automated workflow
   npm run deploy:contracts       # Deploy new contracts
   npm run update:env            # Update .env files
   npm run migrate:users         # Migrate existing users
   npm run verify:migration      # Verify migration success
   ```

4. **Add migration status to admin dashboard**
   - Show pending migrations
   - One-click migration trigger
   - Progress tracking

#### ❌ DON'T DO THIS:
- ❌ Hardcode contract addresses in code
- ❌ Manually update multiple .env files
- ❌ Forget to migrate existing users
- ❌ Deploy contracts without updating deployments.json

### 4. Recommended File Structure

```
contracts/
  deployments.json                    # Latest addresses
  deployment-history.json             # All versions
  scripts/
    deploy-and-migrate.ts            # Combined deployment + migration
    migrate-all-sbts.ts              # User migration (already created)
    verify-migration.ts              # Post-migration checks

scripts/
  sync-deployments.ts                # Copy deployments.json to frontend/indexer
  check-migration-status.ts          # Check if migration needed

frontend/
  lib/
    contracts.ts                     # Dynamic contract resolution
    use-contracts.ts                 # React hook for contracts
  
indexer/
  src/
    contract-loader.ts               # Load contracts from deployments.json
```

### 5. Deployment Checklist

When deploying new contracts:

```bash
# 1. Deploy contracts
cd contracts
npx hardhat run scripts/deploy.ts --network arbitrumSepolia

# 2. Verify deployments.json updated
cat deployments.json

# 3. Sync to frontend & indexer
node ../scripts/sync-deployments.js

# 4. Migrate existing users
npx hardhat run scripts/migrate-all-sbts.ts --network arbitrumSepolia

# 5. Restart indexer (picks up new contract)
cd ../indexer
npm restart

# 6. Verify migration
node ../scripts/verify-migration.js
```

### 6. Auto-Migration on Frontend

```typescript
// hooks/useMigrationCheck.ts
export function useMigrationCheck() {
  const { address } = useAccount();
  
  useEffect(() => {
    async function checkMigration() {
      if (!address) return;
      
      const { data: user } = await supabase
        .from('users')
        .select('contract_version, sbt_token_id')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (user && user.contract_version !== CURRENT_VERSION) {
        // Show migration banner
        toast.info('Your SBT needs migration to new contract');
        // Auto-trigger migration or show button
      }
    }
    
    checkMigration();
  }, [address]);
}
```

## Quick Reference Commands

```bash
# Check if migration needed
npm run migration:check

# Run full migration
npm run migration:run

# Verify migration status
npm run migration:verify

# Rollback (if needed)
npm run migration:rollback
```

## Summary

**Key Principles:**
1. **Single Source of Truth** - deployments.json
2. **Automated Sync** - Scripts copy to all services
3. **Migration Scripts** - Always migrate users after contract updates
4. **Version Tracking** - Database tracks which contract version users are on
5. **Detection System** - Automatically detect when migration needed

This way, future contract updates will be:
- ✅ Automated
- ✅ Traceable
- ✅ No manual .env editing
- ✅ Zero user data loss
