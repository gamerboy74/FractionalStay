# Logging Setup - Winston Implementation

## Overview

Winston logger has been implemented for error logging and address checksum validation has been fixed across the project.

## Implementation Details

### Relayer Service

**Location:** `relayer-service/src/logger.ts`

- Winston logger with file and console transports
- Logs saved to:
  - `logs/error.log` - Error level logs
  - `logs/combined.log` - All logs
- Console output with colorized formatting
- Log levels: error, warn, info, debug

**Usage:**
```typescript
import logger from './logger'

logger.info('Message', { meta: 'data' })
logger.error('Error message', error, { context: 'data' })
logger.warn('Warning message', { meta: 'data' })
logger.debug('Debug message', { meta: 'data' })
```

### Frontend

**Location:** `frontend/lib/logger.ts`

- Client-side logger for browser
- Uses console in browser (can be extended for remote logging)
- Different log levels for production vs development
- Structured logging with metadata

**Usage:**
```typescript
import { logger } from '@/lib/logger'

logger.error('Error message', error, { meta: 'data' })
logger.warn('Warning message', { meta: 'data' })
logger.info('Info message', { meta: 'data' })
logger.debug('Debug message', { meta: 'data' })
```

## Address Checksum Fixes

### Frontend Contracts

**Location:** `frontend/lib/contracts.ts`

- All contract addresses are now validated and checksummed
- Uses `getAddress` from viem to ensure proper checksum format
- Logs warnings when addresses are missing or invalid
- Prevents "bad address checksum" errors

### API Routes

All API routes now:
- Validate address format using `isAddress` from viem
- Checksum addresses using `getAddress` from viem
- Log errors using Winston/logger instead of console.error

**Updated routes:**
- `frontend/app/api/property/[id]/route.ts`
- `frontend/app/api/balance/[id]/route.ts`
- `frontend/app/api/listing/[id]/route.ts`

### Relayer Service

**Location:** `relayer-service/src/index.ts`

- Contract addresses validated and checksummed on initialization
- Uses `ethers.getAddress()` for checksumming
- Proper error logging for invalid addresses

## Log Files

### Relayer Service Logs

Logs are stored in `relayer-service/logs/`:
- `error.log` - Only error level logs
- `combined.log` - All logs

**Note:** `logs/` directory is in `.gitignore`

## Environment Variables

### Relayer Service

```env
LOG_LEVEL=info  # Optional: error, warn, info, debug (default: info)
NODE_ENV=production  # Optional: affects log format
```

## Benefits

1. ✅ **Structured Logging** - All logs include timestamps, levels, and metadata
2. ✅ **Error Tracking** - Errors logged to files for debugging
3. ✅ **Address Validation** - No more checksum errors
4. ✅ **Production Ready** - Different log levels for dev vs production
5. ✅ **Searchable** - JSON format logs can be easily parsed

## Usage Examples

### Relayer Service

```typescript
// Info log
logger.info('Rent deposit successful', { tokenId: 1, amount: 1000 })

// Error log with context
logger.error('Failed to deposit rent', error, { tokenId: 1, amount: 1000 })

// Debug log
logger.debug('USDC balance checked', { balance: 1000, walletAddress: '0x...' })
```

### Frontend

```typescript
// Error log
logger.error('Failed to fetch property', error, { tokenId: 1 })

// Warning log
logger.warn('Missing address parameter', { tokenId: 1 })

// Info log
logger.info('Property loaded successfully', { tokenId: 1 })
```

## Next Steps

To use logging in new code:

1. Import logger:
   ```typescript
   // Relayer service
   import logger from './logger'
   
   // Frontend
   import { logger } from '@/lib/logger'
   ```

2. Replace console.error/log with logger:
   ```typescript
   // Before
   console.error('Error:', error)
   
   // After
   logger.error('Error message', error, { context: 'data' })
   ```

3. Always checksum addresses:
   ```typescript
   // Before
   const address = userInput
   
   // After
   import { getAddress, isAddress } from 'viem'
   if (!isAddress(address)) {
     logger.error('Invalid address', undefined, { address })
     return
   }
   const checksummed = getAddress(address)
   ```






