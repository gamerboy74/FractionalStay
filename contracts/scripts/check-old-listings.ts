import { ethers } from "hardhat";

/**
 * Check all listings on old Marketplace contract
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔍 Checking listings with account:", deployer.address);

  // Old Marketplace contract address
  const OLD_MARKETPLACE_ADDRESS = "0x9598601209047955c7131b7Fabd9bA0e491c82e2";
  
  // Load Marketplace ABI
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(OLD_MARKETPLACE_ADDRESS);

  console.log("\n📦 Connected to Marketplace:", OLD_MARKETPLACE_ADDRESS);

  // Get total listing count
  const listingCount = await marketplace.listingCount();
  const totalListings = Number(listingCount);
  console.log(`\n📊 Total listings on old contract: ${totalListings}\n`);

  if (totalListings === 0) {
    console.log("⚠️  No listings found");
    return;
  }

  // Check each listing
  for (let i = 1; i <= totalListings; i++) {
    try {
      const listing = await marketplace.listings(i);
      
      console.log("=".repeat(60));
      console.log(`Listing ID: ${i}`);
      console.log(`Seller: ${listing.seller}`);
      console.log(`Token ID: ${listing.tokenId.toString()}`);
      console.log(`Amount: ${listing.amount.toString()} shares`);
      console.log(`Price/Share: $${ethers.formatUnits(listing.pricePerShare, 6)}`);
      console.log(`Active: ${listing.active ? "✅ YES" : "❌ NO"}`);
      console.log(`Is Yours: ${listing.seller.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO"}`);
      console.log("=".repeat(60) + "\n");
      
    } catch (error: any) {
      console.log(`⚠️  Listing ${i} doesn't exist or error: ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

