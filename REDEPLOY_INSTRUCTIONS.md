# Redeploy PropertyShare1155 Contract with purchaseShares function

## Changes Made:
1. Added USDC token address to constructor
2. Added `seller` field to Property struct
3. Added `purchaseShares(tokenId, amount)` public function
4. Users can now buy shares directly with USDC payment

## Steps to Redeploy:

### 1. Compile Contract
```bash
cd contracts
npx hardhat compile
```

### 2. Deploy New Contract
```bash
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

### 3. Update Frontend .env.local
Update the new PropertyShare1155 contract address:
```
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=<NEW_ADDRESS>
```

### 4. Update Database
Update all properties in database with the new contract if needed.

## New Contract Function:

```solidity
function purchaseShares(uint256 tokenId, uint256 amount) external {
    // Buyer must approve USDC to this contract first
    // USDC is transferred from buyer to property seller
    // Shares are minted to buyer
}
```

## Frontend Flow:
1. User approves USDC to PropertyShare1155 contract
2. User calls `purchaseShares(tokenId, amount)`
3. USDC transfers from user to property seller
4. Shares mint to user's wallet
5. User pays gas fees (not relayer)
