<!-- 7e266128-388d-4e36-ade1-5b4b814241d3 7b49906e-1362-432d-99b7-4d6769bee7ae -->
# Fix Marketplace Listings Not Showing

## Problem Analysis

**Root Cause:**

The marketplace listings API (`/api/marketplace/listings/route.ts`) filters out listings where the property status is NOT 'ACTIVE' (lines 76-79). However:

1. Properties are created with status 'DRAFT' by default
2. Listings are saved to database with status 'ACTIVE' ✅
3. But listings won't show because their associated property is 'DRAFT' ❌

**Current Filter Logic:**

```typescript
// Only include listings where property is ACTIVE
if (!property || property.status !== 'ACTIVE') {
  return null  // ❌ This hides valid listings!
}
```

## Solution

### Fix 1: Remove Property Status Filter (Primary Fix)

A listing's visibility should depend on its own status, not the property status. The property status (DRAFT/ACTIVE) is separate from listing availability.

**File**: `frontend/app/api/marketplace/listings/route.ts`

- Remove or modify the property status filter
- Show listings if listing status is 'ACTIVE', regardless of property status
- Only filter out if property doesn't exist at all

### Fix 2: Optimize Listing Creation Flow (Secondary)

While fixing the display issue, also optimize the listing creation to use event extraction instead of guessing listingId.

**File**: `frontend/components/CreateListingForm.tsx`

- Extract listingId from ListingCreated event in transaction receipt
- Remove manual database sync (let indexer handle it)
- Show success message with accurate listingId

**File**: `frontend/lib/contract-events.ts`

- Add `extractListingIdFromReceipt()` function
- Add `extractListingIdWithRetry()` function
- Use MARKETPLACE_ABI to decode ListingCreated event

## Benefits

✅ **Listings Will Show**: Removes incorrect property status filter

✅ **Accurate listingId**: Extract from event instead of guessing

✅ **No Race Conditions**: Let indexer handle database sync

✅ **Better UX**: Faster, more reliable listing creation

## Files to Modify

1. **Fix Display**: `frontend/app/api/marketplace/listings/route.ts` - Remove property status filter
2. **Optimize Creation**: `frontend/lib/contract-events.ts` - Add listingId extraction function
3. **Optimize Creation**: `frontend/components/CreateListingForm.tsx` - Use event extraction, remove manual sync

### To-dos

- [ ] Create script to query actual database schema for properties table
- [ ] Run script and analyze actual schema vs migration file vs code expectations
- [ ] Update migration file to match actual database schema
- [ ] Verify API route saves token_id as INTEGER and uses correct column names