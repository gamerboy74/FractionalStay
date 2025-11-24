# Gas Fee and USDC Calculation Fix

## Issue Summary
The frontend was displaying incorrect fee calculations that didn't match what the smart contracts actually charge.

## Problems Identified

### 1. **BuySharesForm (Direct Purchase)**
- **Problem**: Showed fake "Platform Fee (2%)" and "GST (18%)" that were NEVER charged by the smart contract
- **Reality**: The `PropertyShare1155.purchaseShares()` function only transfers `pricePerShare × shares` in USDC from buyer to seller
- **Result**: Users saw inflated totals (₹1,170 shown vs $117 actually charged)

### 2. **Gas Fee Confusion**
- **Problem**: No clear explanation that gas fees are paid separately in native token (ETH/ARB)
- **Reality**: Gas fees are ~$0.10-$0.50 and paid in ETH, NOT in USDC
- **Users thought**: USDC balance needs to cover gas fees too

### 3. **Marketplace Listing Purchase**
- **Problem**: Didn't show the 2.5% marketplace fee that IS actually charged
- **Reality**: Marketplace contract charges 2.5% fee (deducted from seller proceeds)
- **Result**: Users weren't informed about the actual fee structure

## Smart Contract Behavior

### Direct Purchase (`PropertyShare1155.purchaseShares`)
```solidity
uint256 totalPrice = properties[tokenId].pricePerShare * amount;
usdc.transferFrom(msg.sender, seller, totalPrice);
```
- **Buyer pays**: `pricePerShare × shares` in USDC
- **Seller receives**: Same amount (no fees deducted)
- **Gas fees**: Paid separately in ETH/ARB

### Marketplace Purchase (`Marketplace.purchase`)
```solidity
uint256 totalPrice = listing.amount * listing.pricePerShare;
uint256 feeAmount = (totalPrice * marketplaceFeeBps) / 10000; // 2.5%
uint256 sellerAmount = totalPrice - feeAmount;
```
- **Buyer pays**: `pricePerShare × shares` in USDC
- **Marketplace keeps**: 2.5% fee
- **Seller receives**: 97.5% of total price
- **Gas fees**: Paid separately in ETH/ARB

## Fixes Applied

### 1. Fixed BuySharesForm.tsx
**Removed:**
- Fake "Investment Amount", "Platform Fee (2%)", "GST (18%)" breakdown
- INR calculations (kept it simple in USDC)

**Added:**
- Clear display: `Price per Share × Number of Shares = Total USDC Required`
- Gas fee disclaimer: "Network gas fees will be paid separately in ETH/ARB (usually $0.10-$0.50)"
- Accurate USDC balance check against actual cost

### 2. Fixed MarketplaceContent.tsx
**Added:**
- Clear note about 2.5% marketplace fee (deducted from seller)
- Gas fee disclaimer for marketplace purchases
- Accurate total cost display

## Example: Before vs After

### Direct Purchase (10 shares @ $117/share)

**BEFORE (Wrong):**
```
Investment Amount:     ₹117,000
Platform Fee (2%):     ₹2,340
GST (18%):            ₹421
─────────────────────────────
Total Amount:         ₹119,761
```

**AFTER (Correct):**
```
Price per Share:       $117.00 USDC
Number of Shares:      10
─────────────────────────────
Total USDC Required:   $1,170.00 USDC

ℹ️ Gas Fees: Network gas fees will be paid separately 
in ETH/ARB (usually $0.10-$0.50). Make sure you have 
some ETH in your wallet.
```

### Marketplace Purchase

**BEFORE (Incomplete):**
```
Total Price: $1,170
```

**AFTER (Complete):**
```
Your Total Cost: $1,170 USDC

ℹ️ Note: A 2.5% marketplace fee ($29.25) is deducted 
from seller's proceeds. Gas fees (~$0.10-$0.50 in ETH) 
paid separately.
```

## Key Takeaways

1. **USDC payments** are handled by smart contracts exactly as calculated: `price × quantity`
2. **Gas fees** are ALWAYS paid in native token (ETH/ARB), never in USDC
3. **Direct purchases** have NO platform fees (seller keeps 100%)
4. **Marketplace purchases** have a 2.5% fee (deducted from seller, not added to buyer cost)
5. **UI must match smart contract behavior** - no fake fees!

## Testing Checklist

- [x] Verify direct purchase shows correct USDC amount
- [x] Verify gas fee disclaimer is clear
- [x] Verify marketplace purchase shows 2.5% fee note
- [x] Verify USDC balance checks work correctly
- [x] Verify no fake fees are shown

## Related Files

- `frontend/components/BuySharesForm.tsx` - Fixed direct purchase UI
- `frontend/components/marketplace/MarketplaceContent.tsx` - Fixed marketplace purchase UI
- `contracts/contracts/PropertyShare1155.sol` - Direct purchase logic
- `contracts/contracts/Marketplace.sol` - Marketplace purchase logic with 2.5% fee
