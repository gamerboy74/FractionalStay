# Transfer Ownership Script

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install ethers dotenv
   ```

2. **Create `.env` file in project root:**
   ```
   PRIVATE_KEY=your_private_key_here
   ```

3. **Run the script:**
   ```bash
   node scripts/transfer-ownership.js
   ```

## Important Security Notes

- ⚠️ **NEVER** share your private key
- ⚠️ **NEVER** commit `.env` file to git
- ⚠️ **NEVER** run this on a public server
- ✅ Only run this script on your local machine
- ✅ Make sure `.env` is in `.gitignore`

## What it does

- Connects to Arbitrum Sepolia
- Checks if your wallet is the current owner
- Transfers ownership to: `0xac869c83abde601bb9a0379170fa7d51e7a47c55`
- Shows transaction details and Arbiscan link

## After Transfer

Once ownership is transferred, you can:
- Assign ward boys from the new owner wallet (0xac869c83abde601bb9a0379170fa7d51e7a47c55)
- Use the admin panel to manage properties
