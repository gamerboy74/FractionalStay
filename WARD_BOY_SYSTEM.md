# Ward Boy Property Management System

## Overview
The RevenueSplitter contract now includes a comprehensive ward boy (property manager) system for managing property revenue distribution.

## System Flow

### 1. **Admin Assigns Ward Boy**
- Admin assigns a ward boy (property manager) for each property
- Function: `assignPropertyManager(tokenId, managerAddress)`
- Only admin can assign ward boys
- Each property has one designated ward boy

### 2. **Ward Boy Deposits Net Amount**
- Ward boy collects gross rent from tenants
- Deducts miscellaneous fees (repairs, maintenance, utilities, etc.)
- Deposits **net amount** to the contract
- Function: `depositRentByManager(tokenId, netAmount, grossRent, miscellaneousFee)`
- Only the assigned ward boy can deposit for their property
- Funds go into `pendingDistribution` (not yet available for claims)

### 3. **Admin Triggers Payout (callOutPay)**
- Admin reviews the deposit and clicks "Call Out Pay"
- Function: `callOutPay(tokenId)`
- System automatically:
  - Deducts **3% platform fee** (configurable via `platformFeeBps`)
  - Transfers platform fee to `feeRecipient`
  - Makes remaining amount available for shareholder claims
  - Moves funds from `pendingDistribution` to `totalDeposited`

### 4. **Shareholders Claim Their Portion**
- Shareholders can now claim their proportional share
- Function: `claim(tokenId)`
- Each shareholder receives amount based on their share percentage
- Pull-based model (shareholders must claim themselves)

## Key Functions

### Admin Functions
```solidity
// Assign ward boy to property
assignPropertyManager(uint256 tokenId, address manager)

// Remove ward boy from property
removePropertyManager(uint256 tokenId)

// Trigger payout distribution (deduct platform fee and distribute)
callOutPay(uint256 tokenId)

// Update platform fee percentage
setPlatformFee(uint256 newFeeBps)

// Update fee recipient address
setFeeRecipient(address newRecipient)
```

### Ward Boy Functions
```solidity
// Deposit net rent after deducting miscellaneous fees
depositRentByManager(
    uint256 tokenId,
    uint256 netAmount,          // Net amount after misc fees
    uint256 grossRent,          // Original gross rent (for tracking)
    uint256 miscellaneousFee    // Fees deducted (for tracking)
)
```

### Shareholder Functions
```solidity
// Claim rewards for a property
claim(uint256 tokenId)

// View claimable amount
getClaimableAmount(uint256 tokenId, address holder)
```

### View Functions
```solidity
// Get pending distribution (waiting for admin to trigger)
getPendingDistribution(uint256 tokenId)

// Check if address is property manager
isPropertyManager(uint256 tokenId, address account)

// View total deposited for a property
totalDeposited[tokenId]

// View property manager address
propertyManagers[tokenId]
```

## Revenue Flow Example

### Example: ₹50,000 Monthly Rent

1. **Ward Boy Collects Rent**: ₹50,000
2. **Deduct Miscellaneous**: ₹5,000 (repairs, utilities, etc.)
3. **Ward Boy Deposits**: ₹45,000 (net amount)
4. **Admin Triggers Payout**:
   - Platform Fee (3%): ₹1,350
   - Available for Shareholders: ₹43,650
5. **Shareholders Claim**: Based on their share percentage
   - Shareholder with 10%: ₹4,365
   - Shareholder with 25%: ₹10,912.50
   - And so on...

## Events

```solidity
// When ward boy is assigned
event PropertyManagerAssigned(uint256 indexed tokenId, address indexed manager)

// When ward boy is removed
event PropertyManagerRemoved(uint256 indexed tokenId, address indexed manager)

// When ward boy deposits funds
event FundsDepositedByManager(
    uint256 indexed tokenId,
    address indexed manager,
    uint256 netAmount,
    uint256 grossRent,
    uint256 miscellaneousFee
)

// When admin triggers payout
event PayoutTriggered(
    uint256 indexed tokenId,
    uint256 grossAmount,
    uint256 platformFee,
    uint256 netForDistribution
)

// When shareholder claims
event RewardClaimed(
    uint256 indexed tokenId,
    address indexed holder,
    uint256 amount
)
```

## Security Features

1. **Role-Based Access**:
   - Only assigned ward boy can deposit for their property
   - Only admin can assign/remove ward boys
   - Only admin can trigger payouts

2. **Two-Step Distribution**:
   - Funds first go to `pendingDistribution`
   - Admin must approve via `callOutPay`
   - Prevents unauthorized distributions

3. **Validation Checks**:
   - Property must exist
   - Net amount must be positive
   - Gross rent must equal net + miscellaneous
   - Ward boy must be assigned

## Frontend Implementation Notes

### For Admin Dashboard:
1. Add "Assign Ward Boy" button for each property
2. Add "Call Out Pay" button to trigger distribution
3. Show pending distribution amount
4. Show platform fee calculation preview

### For Ward Boy Dashboard:
1. Show assigned properties
2. Form to input: Gross Rent, Miscellaneous Fee
3. Automatically calculate Net Amount
4. "Deposit Rent" button
5. Show deposit history

### For Shareholder Dashboard:
1. Show claimable amount per property
2. "Claim Rewards" button
3. Show claim history
4. Show pending distributions (not yet available)

## Migration Notes

- Old `depositRent` function still exists for backward compatibility
- New system uses `depositRentByManager` + `callOutPay`
- Recommend migrating all properties to new ward boy system
- Platform fee configurable (default 3% = 300 basis points)

## Next Steps

1. Deploy updated RevenueSplitter contract
2. Update frontend to include ward boy management UI
3. Create ward boy dashboard
4. Add admin controls for triggering payouts
5. Update shareholder claim interface
6. Test complete flow on testnet
