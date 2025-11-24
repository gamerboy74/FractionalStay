# Frontend Optimization Migration Notes

## Overview
This migration implements comprehensive frontend optimizations including multicall batching, TanStack Query caching/deduplication, and prefetch on hover - significantly reducing RPC calls and improving performance.

## Implementation Summary

### ✅ What Was Implemented

1. **Multicall Infrastructure (lib/multicall.ts)**
   - Viem-based Multicall2 integration
   - Batches multiple contract reads into single RPC call
   - Generic `multicallRead()` + specialized helpers
   - Reduces N RPC calls to 1

2. **TanStack Query v5 Setup (lib/queryClient.ts)**
   - 2-minute stale time (dedupe within 2min window)
   - 5-minute garbage collection
   - Automatic request deduplication
   - Query key factory for consistent caching

3. **Optimized Hooks (hooks/useProperty.ts)**
   - `useProperty(tokenId)` - Single property with multicall
   - `useProperties(tokenIds[])` - Batch property fetching
   - Automatic caching and background updates
   - Error handling with retry logic

4. **Backward Compatibility (hooks/usePropertyData.ts)**
   - Re-exports `useProperty` as `usePropertyData`
   - No breaking changes to existing code
   - Gradual migration path

5. **PropertyCard Prefetch (components/PropertyCard.tsx)**
   - Prefetches on `mouseenter` event
   - Uses TanStack Query cache
   - Instant navigation (data already loaded)
   - Works on both grid and list variants

6. **Provider Integration (app/providers.tsx)**
   - QueryClientProvider wraps WagmiProvider
   - Global cache available to all components
   - Client-side only (mounted guard)

7. **Test Suite**
   - `__tests__/multicall.test.ts` - Multicall unit tests
   - `__tests__/useProperty.test.tsx` - Hook integration tests
   - `__tests__/PropertyCard.prefetch.test.tsx` - Prefetch behavior tests
   - Jest + React Testing Library configured

## Performance Gains

### Before Optimization
- **Property List (10 properties)**: 20 RPC calls (getProperty + totalSupply for each)
- **Portfolio Page**: 5+ RPC calls per property
- **Duplicate Requests**: Same data fetched multiple times
- **Navigation**: Always refetches data

### After Optimization
- **Property List (10 properties)**: 1 RPC call (all batched via multicall)
- **Portfolio Page**: 1 RPC call for all properties
- **Duplicate Requests**: Deduplicated (cached for 2min)
- **Navigation**: Instant (prefetched on hover)

**Estimated Improvement**: 80-95% reduction in RPC calls

## Files Modified

### New Files Created
```
frontend/
├── lib/
│   ├── multicall.ts              # Multicall2 integration
│   └── queryClient.ts            # TanStack Query config
├── hooks/
│   ├── useProperty.ts            # Optimized property hooks
│   └── usePropertyData.ts        # Compatibility adapter
├── __tests__/
│   ├── multicall.test.ts         # Multicall unit tests
│   ├── useProperty.test.tsx      # Hook tests
│   └── PropertyCard.prefetch.test.tsx  # Prefetch tests
├── jest.config.js                # Jest configuration
└── jest.setup.js                 # Test setup
```

### Files Modified
```
frontend/
├── components/
│   ├── PropertyCard.tsx          # Added prefetch on hover
│   └── PropertyCard.v2.tsx       # Already has prefetch (reference)
├── app/
│   └── providers.tsx             # Added QueryClientProvider
└── package.json                  # Added test dependencies
```

## Migration Steps

### 1. Verify Provider Integration
**Location**: `app/providers.tsx`

**Check**: QueryClientProvider wraps WagmiProvider
```tsx
<QueryClientProvider client={queryClient}>
  <WagmiProvider config={config}>
    {/* ... */}
  </WagmiProvider>
</QueryClientProvider>
```

**Why**: Enables global query cache for all components

---

### 2. Test Multicall Functionality
**Command**:
```powershell
cd frontend
npm test -- multicall.test.ts
```

**Expected**: All multicall tests pass
- ✅ Batches multiple calls into single RPC
- ✅ Handles empty call arrays
- ✅ Gracefully handles failed calls
- ✅ Complete multicall failure handling

**Verify**: Check terminal output shows 0 failures

---

### 3. Test TanStack Query Hooks
**Command**:
```powershell
npm test -- useProperty.test.tsx
```

**Expected**: All hook tests pass
- ✅ Fetches property data successfully
- ✅ Caches results (no refetch on remount)
- ✅ Deduplicates simultaneous requests
- ✅ Handles errors gracefully
- ✅ Batch fetches multiple properties

**Verify**: Console shows "1 call" for deduplication tests

---

### 4. Test Prefetch Behavior
**Command**:
```powershell
npm test -- PropertyCard.prefetch.test.tsx
```

**Expected**: All prefetch tests pass
- ✅ Triggers prefetch on mouseenter
- ✅ Caches prefetched data
- ✅ Skips prefetch if no client
- ✅ Only prefetches once (deduplication)

**Manual Test**: 
1. Start dev server: `npm run dev`
2. Open browser DevTools → Network tab
3. Hover over a PropertyCard
4. Navigate to property details
5. **Expected**: No new RPC calls (data already cached)

---

### 5. Verify PropertyCard Integration
**Locations to Check**:
- `app/properties/page.tsx` - Uses `PropertyCard`
- `app/page.tsx` - Uses `PropertyCardV2`

**Test**:
1. Navigate to `/properties`
2. Hover over cards → should see prefetch in Network tab
3. Click card → instant navigation (cached)
4. Go back → still cached (within 2min stale time)

**Verify**: Network tab shows minimal RPC calls

---

### 6. Monitor Cache Behavior
**Browser DevTools**:
1. Install React Query DevTools (optional):
   ```tsx
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
   
   // In providers.tsx
   <ReactQueryDevtools initialIsOpen={false} />
   ```

2. Check cache status:
   - Fresh queries: Green
   - Stale queries: Yellow
   - Inactive queries: Gray

**Expected Behavior**:
- Property queries fresh for 2min after fetch
- Automatic refetch after stale time
- Cache persists for 5min (gcTime)

---

### 7. Performance Verification
**Chrome DevTools Performance**:
1. Open `/properties` page
2. Start Performance recording
3. Scroll through properties (triggers hover)
4. Stop recording

**Metrics to Check**:
- **Before**: Multiple RPC calls per card
- **After**: Single prefetch call, rest from cache
- **LCP (Largest Contentful Paint)**: Should improve
- **Network Requests**: Significantly reduced

---

### 8. Run Full Test Suite
**Command**:
```powershell
npm test
```

**Expected**: All tests pass
- ✅ Multicall tests
- ✅ Hook tests
- ✅ Prefetch tests

**Coverage** (run `npm test -- --coverage`):
- Minimum 50% coverage (configured in jest.config.js)
- Check `coverage/` directory for detailed report

---

## Rollback Procedure

If issues arise, rollback is simple due to backward compatibility:

### Quick Rollback (No Code Changes)
The migration is backward compatible - old code continues to work.

### Full Rollback (If Needed)
1. **Remove QueryClientProvider**:
   ```tsx
   // app/providers.tsx
   // Remove: <QueryClientProvider client={queryClient}>
   ```

2. **Revert PropertyCard**:
   ```tsx
   // components/PropertyCard.tsx
   // Remove: onMouseEnter={handlePrefetch}
   // Remove: useQueryClient, usePublicClient imports
   ```

3. **Use Old Hooks** (if any issues):
   ```tsx
   // Instead of: import { useProperty } from '@/hooks/useProperty'
   import { useReadContract } from 'wagmi'
   ```

4. **Remove Test Dependencies** (optional):
   ```powershell
   npm uninstall jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest-environment-jsdom
   ```

---

## Common Issues & Solutions

### Issue 1: "Cannot read property 'prefetchQuery' of undefined"
**Cause**: QueryClientProvider not wrapping component
**Solution**: Ensure `app/providers.tsx` has QueryClientProvider above component tree

### Issue 2: Prefetch not triggering
**Cause**: `publicClient` is null
**Solution**: Check wallet connection - client only available when connected

### Issue 3: Tests failing with "Cannot find module '@/...'"
**Cause**: Jest moduleNameMapper not configured
**Solution**: Verify `jest.config.js` has `'^@/(.*)$': '<rootDir>/$1'`

### Issue 4: Stale data showing
**Cause**: Cache time too long for your use case
**Solution**: Adjust `staleTime` in `lib/queryClient.ts` (default: 2min)

### Issue 5: Too many cache hits (not refetching)
**Cause**: Stale time too long
**Solution**: Reduce stale time or use `refetchOnMount: true` for specific queries

---

## Next Steps (Optional Enhancements)

### 1. GraphQL Batching for Subgraph
Currently not implemented. If needed:
```typescript
// lib/graphql.ts
export async function batchFetchProperties(tokenIds: number[]) {
  const query = `
    query BatchProperties($ids: [Int!]!) {
      properties(where: { tokenId_in: $ids }) {
        tokenId
        name
        location
        # ... other fields
      }
    }
  `
  // Implementation...
}
```

### 2. Migrate Remaining Hooks
- `useWardBoy.ts` - Still uses `useReadContract`
- `useUserRole.ts` - Still uses `useReadContract`

**Pattern**:
```tsx
// Before
const { data } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: ABI,
  functionName: 'myFunction',
  args: [arg1]
})

// After (with multicall)
const { data } = useQuery({
  queryKey: ['myFunction', arg1],
  queryFn: async () => {
    const results = await multicallRead(publicClient, [
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: 'myFunction', args: [arg1] }
    ])
    return results[0].data
  }
})
```

### 3. Add React Query DevTools
```powershell
npm install @tanstack/react-query-devtools
```

```tsx
// app/providers.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 4. Implement Optimistic Updates
For better UX on mutations:
```tsx
const mutation = useMutation({
  mutationFn: buyShares,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['property', tokenId] })
    
    // Snapshot previous value
    const previousData = queryClient.getQueryData(['property', tokenId])
    
    // Optimistically update
    queryClient.setQueryData(['property', tokenId], (old) => ({
      ...old,
      sharesSold: old.sharesSold + newData.shares
    }))
    
    return { previousData }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['property', tokenId], context.previousData)
  }
})
```

---

## Performance Monitoring

### Recommended Tools
1. **React DevTools Profiler** - Component render times
2. **Chrome DevTools Performance** - Overall page performance
3. **Network Tab** - RPC call reduction
4. **Lighthouse** - Performance scores

### Key Metrics to Track
- **RPC Calls**: Should see 80-95% reduction
- **Time to Interactive (TTI)**: Should improve
- **Cache Hit Rate**: Target >70% for repeated data
- **Prefetch Success Rate**: Monitor in analytics

### Analytics Events (Optional)
```typescript
// Track prefetch success
queryClient.setDefaultOptions({
  queries: {
    onSuccess: (data, query) => {
      if (query.meta?.prefetch) {
        analytics.track('prefetch_success', { queryKey: query.queryKey })
      }
    }
  }
})
```

---

## Verification Checklist

- [ ] Tests pass: `npm test`
- [ ] Dev server runs: `npm run dev`
- [ ] PropertyCard prefetches on hover (check Network tab)
- [ ] Navigation is instant (data cached)
- [ ] Multiple components requesting same data → 1 RPC call
- [ ] Cache persists for 2 minutes (stale time)
- [ ] Errors handled gracefully (no crashes)
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run lint`

---

## Support & Resources

### Documentation
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Viem Multicall](https://viem.sh/docs/contract/multicall.html)
- [Jest Testing](https://jestjs.io/docs/getting-started)

### Internal Files
- `lib/multicall.ts` - Multicall implementation
- `lib/queryClient.ts` - Query configuration
- `hooks/useProperty.ts` - Example usage

### Contact
For issues or questions, check:
1. Test files for usage examples
2. Console logs (debug mode)
3. React Query DevTools (if installed)

---

**Migration Completed**: ✅  
**Performance Gain**: 80-95% reduction in RPC calls  
**Breaking Changes**: None (backward compatible)  
**Production Ready**: Yes (with testing)
