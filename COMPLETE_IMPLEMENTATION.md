# FractionalStay Platform - Complete Implementation Guide

## 🎉 Project Overview

**FractionalStay** is a full-stack blockchain-based platform for fractional real estate investment built on **Arbitrum Sepolia**. The platform enables users to buy tokenized property shares, earn rental yields, and trade shares on a secondary marketplace.

---

## 📁 Project Structure

```
FractionalEstate/
├── contracts/                      # Smart Contracts (Hardhat)
│   ├── contracts/
│   │   ├── PropertyShare1155.sol  # ERC-1155 Property Tokens
│   │   ├── RevenueSplitter.sol    # Rental Revenue Distribution
│   │   ├── Marketplace.sol        # Secondary Market Trading
│   │   ├── Governance.sol         # DAO Governance
│   │   └── MockUSDC.sol           # Testnet USDC
│   ├── scripts/
│   │   ├── deploy.ts              # Deploy all contracts
│   │   └── setup.ts               # Create sample properties
│   └── deployments.json           # Deployed contract addresses
│
├── frontend/                       # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx               # Homepage
│   │   ├── properties/page.tsx    # All Properties List
│   │   ├── property/[id]/page.tsx # Property Details
│   │   ├── dashboard/page.tsx     # User Portfolio
│   │   ├── marketplace/page.tsx   # Secondary Market
│   │   └── admin/page.tsx         # Admin Panel
│   ├── components/
│   │   ├── PropertyCard.tsx       # Property Card Component
│   │   ├── BuySharesForm.tsx      # Investment Form
│   │   ├── ClaimRewards.tsx       # Claim Rewards Component
│   │   ├── CreateListingForm.tsx  # Marketplace Listing Form
│   │   └── WalletButton.tsx       # RainbowKit Wallet Connect
│   └── lib/
│       ├── contracts.ts           # Contract ABIs & Addresses
│       └── wagmi.ts               # Wagmi Configuration
│
└── relayer-service/               # Backend Relayer (Optional)
    └── src/index.ts               # Automated rent distribution
```

---

## 🚀 Quick Start

### 1. **Install Dependencies**

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. **Deploy Smart Contracts**

```bash
cd contracts

# Deploy to Arbitrum Sepolia
npm run deploy:sepolia

# Create sample properties
npm run setup
```

This will:
- Deploy MockUSDC with 1M test tokens
- Deploy PropertyShare1155, RevenueSplitter, Marketplace, Governance
- Create 2 sample properties
- Set up approvals and initial data

### 3. **Configure Frontend**

Copy the deployed addresses to `frontend/.env.local`:

```env
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=0x520c928F5e49182FA48Cd2a52a097bf611021085
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=0x6a77b8B19c8ebd63F6A80895444eEd8E5B7A3129
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x1b31640E6e1f33f7027268eCf9863f7D05fF4bd6
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x3d1930CC252c7539775a466f85126Bc20D29fa46
NEXT_PUBLIC_USDC_ADDRESS=0xa3f2C39207ebb07CC58d42C3236d9E2EEE32b5aB
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 4. **Start Frontend**

```bash
cd frontend
npm run dev
```

Visit: **http://localhost:3001**

---

## 🎨 Design System

### Color Palette
- **Primary Red**: `#EF4444` - CTAs, important actions
- **Green**: `#059669` - Positive metrics, yields
- **Blue**: `#3B82F6` - Information
- **Purple**: `#9333EA` - Marketplace features
- **Gray Scale**: White cards with subtle borders

### Typography
- **Headings**: Bold, 2xl-4xl
- **Body**: Regular, 14-16px
- **Cards**: White background, rounded-lg, shadow-sm

### Components
- **Cards**: Clean white with subtle borders
- **Buttons**: Primary (red), Secondary (outlined)
- **Progress Bars**: Showing funding status
- **Badges**: Yield percentages with green background

---

## 📄 Page Breakdown

### 1. **Homepage** (`/`)
- Hero section with value proposition
- Stats: Properties, Investors, Total Value
- "Why Choose FractionalStay" features
- "How It Works" 5-step process
- Featured properties grid
- Footer with links

### 2. **Properties** (`/properties`)
- Filter by: All, Available, Fully Funded
- Property grid with cards
- Each card shows:
  - Property name & location
  - Price per share (₹)
  - 8.5% monthly yield badge
  - Funding progress bar
  - "View Details" & "Invest Now" buttons

### 3. **Property Details** (`/property/[id]`)
- Image gallery (3 images)
- Property information & description
- Key stats: Value, Total Shares, Available
- Amenities grid with checkmarks
- Expected Monthly Revenue breakdown
- Investment calculator:
  - Share input
  - Platform fee (2%)
  - GST (18%)
  - Total amount
- Invest button
- Claim Rewards section

### 4. **Dashboard** (`/dashboard`)
**Protected** - Requires wallet connection
- Portfolio overview:
  - Total Investment Value
  - Properties Owned
  - Total Returns
- Holdings list with:
  - Property details
  - Ownership percentage
  - Investment value
  - Yield
  - Funding progress
  - **Claim Rewards** button
  - **List for Sale** button

### 5. **Marketplace** (`/marketplace`)
- Secondary market for buying/selling shares
- Listing cards showing:
  - Property name & location
  - Shares listed
  - Price per share
  - Seller address
  - Total price
  - "View Property" & "Buy Now" buttons

### 6. **Admin** (`/admin`)
**Protected** - Requires wallet connection
- **Create New Property**:
  - Name, Location, Total Shares, Price per Share
  - Creates property via API
- **Deposit Rent**:
  - Select property
  - Enter USDC amount
  - Distributes to shareholders
- Current properties list
- Relayer service instructions

---

## 🔗 Smart Contract Functions

### PropertyShare1155
```solidity
createProperty(name, location, totalShares, pricePerShare)
getProperty(tokenId) → Property details
balanceOf(address, tokenId) → User's shares
totalSupply(tokenId) → Total minted shares
```

### RevenueSplitter
```solidity
depositRent(tokenId, amount) → Deposit rental income
claim(tokenId) → Claim user's share of revenue
getClaimableAmount(tokenId, holder) → Check claimable
```

### Marketplace
```solidity
createListing(tokenId, amount, pricePerShare) → List shares
purchase(listingId) → Buy listed shares
cancelListing(listingId) → Cancel own listing
getListing(listingId) → Get listing details
```

### MockUSDC
```solidity
faucet() → Get 10,000 test USDC
approve(spender, amount) → Approve spending
transfer(to, amount) → Transfer USDC
```

---

## 💡 Key Features Implemented

### ✅ Frontend
1. **Responsive Design** - Mobile-first approach
2. **RainbowKit Integration** - Wallet connection
3. **Real-time Data** - Fetches from blockchain
4. **INR Currency Display** - Indian market focused
5. **Investment Calculator** - With fees breakdown
6. **Progress Tracking** - Funding status bars
7. **Claim Rewards UI** - One-click claiming
8. **Secondary Marketplace** - Buy/sell shares
9. **Admin Panel** - Property management

### ✅ Smart Contracts
1. **ERC-1155 Tokens** - Multi-property support
2. **Automated Revenue Split** - Proportional distribution
3. **Marketplace** - P2P share trading
4. **Governance** - Future DAO voting
5. **MockUSDC** - Testnet currency

### ✅ Protected Routes
- Dashboard requires wallet connection
- Admin requires wallet connection
- Forms show wallet prompts when disconnected

---

## 🎯 User Flows

### **Investing in Property**
1. Browse properties on homepage or `/properties`
2. Click "View Details" on a property
3. Connect wallet (RainbowKit modal)
4. Enter number of shares
5. Review investment breakdown
6. Approve USDC (if first time)
7. Click "Invest Now"
8. Confirm transaction in wallet
9. Shares appear in dashboard

### **Claiming Rewards**
1. Go to Dashboard
2. See claimable amount per property
3. Click "Claim Rewards"
4. Confirm transaction
5. USDC transferred to wallet

### **Listing Shares for Sale**
1. Go to Dashboard
2. Click "List for Sale" on a holding
3. Enter number of shares & price
4. Approve marketplace (if first time)
5. Click "Create Listing"
6. Listing appears in Marketplace

### **Buying from Marketplace**
1. Go to Marketplace
2. Browse available listings
3. Click "Buy Now"
4. Approve USDC payment
5. Shares transferred instantly

---

## 🔧 Environment Variables

### Frontend `.env.local`
```env
# Contract Addresses (from deployments.json)
NEXT_PUBLIC_PROPERTY_TOKEN_ADDRESS=
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=
NEXT_PUBLIC_MARKETPLACE_ADDRESS=
NEXT_PUBLIC_GOVERNANCE_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=

# Network
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

### Contracts `.env`
```env
PRIVATE_KEY=your_private_key
ARBISCAN_API_KEY=your_arbiscan_api_key
```

---

## 📊 Sample Data

### Property 1: "Luxury Beachfront Villa"
- Location: "Goa, India"
- Total Shares: 1000
- Price per Share: 100 USDC (₹10,000)
- Token ID: 1

### Property 2: "Downtown Loft Apartment"
- Location: "Mumbai, India"
- Total Shares: 500
- Price per Share: 200 USDC (₹20,000)
- Token ID: 2

---

## 🐛 Troubleshooting

### Port 3000 in use
```bash
# Frontend runs on 3001 automatically
http://localhost:3001
```

### RainbowKit localStorage errors
- These are warnings, not blocking issues
- Functionality works normally

### USDC Balance Issues
```bash
# Get testnet USDC
# In frontend console or through contract interaction:
# Call faucet() on MockUSDC contract
```

### Transaction Failures
- Ensure wallet is on Arbitrum Sepolia
- Check USDC approval
- Verify sufficient gas (ETH)

---

## 🚧 Next Steps / Future Enhancements

1. **Authentication & Authorization**
   - Admin role verification
   - User profiles

2. **Property Metadata**
   - IPFS storage for images
   - Detailed property documents

3. **Advanced Features**
   - Property valuation updates
   - Secondary market order book
   - Governance voting UI

4. **Backend Services**
   - Relayer service for automated rent
   - API for property data
   - Notification system

5. **Analytics**
   - Portfolio performance tracking
   - Historical data charts
   - Yield calculations

---

## 📝 Important Notes

1. **Testnet Only**: Currently deployed on Arbitrum Sepolia
2. **MockUSDC**: Use `faucet()` to get test tokens
3. **Gas Fees**: Need Sepolia ETH for transactions
4. **Smart Contract Security**: Not audited - for demo purposes

---

## 🎓 Tech Stack

- **Blockchain**: Arbitrum Sepolia, Solidity 0.8.20
- **Smart Contracts**: Hardhat, Ethers.js
- **Frontend**: Next.js 14, React 18, TypeScript
- **Web3**: Wagmi 2.5, Viem 2.0, RainbowKit 2.0
- **Styling**: Tailwind CSS 3.4
- **State**: React Hooks

---

## 📞 Support

For issues or questions:
1. Check deployed contract addresses in `deployments.json`
2. Verify `.env.local` configuration
3. Ensure wallet is connected to Arbitrum Sepolia
4. Check console for error logs

---

## 🎉 Congratulations!

You now have a fully functional fractional real estate investment platform with:
- ✅ Smart contracts deployed
- ✅ Frontend with all pages designed
- ✅ Wallet integration
- ✅ Investment flows
- ✅ Secondary marketplace
- ✅ Admin panel
- ✅ Protected routes

**The project is ready for testing and demonstration!**

---

**Version**: 1.0.0  
**Last Updated**: November 22, 2025  
**Network**: Arbitrum Sepolia  
**Built with**: ❤️ and blockchain magic
