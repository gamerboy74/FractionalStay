import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Cancel listings from old Marketplace contract
 * 
 * Usage:
 * 1. Auto-find and cancel your listings:
 *    npx hardhat run scripts/cancel-old-listings.ts --network arbitrumSepolia
 * 
 * 2. Cancel specific listings (if you have the private key):
 *    SELLER_PRIVATE_KEY="0x..." npx hardhat run scripts/cancel-old-listings.ts --network arbitrumSepolia
 * 
 * 3. Cancel specific listing IDs:
 *    LISTING_IDS="1,2" SELLER_PRIVATE_KEY="0x..." npx hardhat run scripts/cancel-old-listings.ts --network arbitrumSepolia
 */
async function main() {
  // Use seller's private key if provided, otherwise use deployer
  let signer;
  if (process.env.SELLER_PRIVATE_KEY) {
    const wallet = new ethers.Wallet(process.env.SELLER_PRIVATE_KEY, ethers.provider);
    signer = wallet;
    console.log("🚀 Using seller's private key from env");
  } else {
    [signer] = await ethers.getSigners();
    console.log("🚀 Using deployer account");
  }
  
  console.log("📝 Account address:", signer.address);
  console.log(
    "💰 Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(signer.address)),
    "ETH"
  );

  // Old Marketplace contract address
  const OLD_MARKETPLACE_ADDRESS = "0x9598601209047955c7131b7Fabd9bA0e491c82e2";
  
  // Load Marketplace ABI
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(OLD_MARKETPLACE_ADDRESS);

  console.log("\n📦 Connected to Marketplace:", OLD_MARKETPLACE_ADDRESS);

  // Get total listing count
  const listingCount = await marketplace.listingCount();
  const totalListings = Number(listingCount);
  console.log(`\n📊 Total listings on old contract: ${totalListings}`);

  // Find all active listings owned by deployer
  console.log("\n🔍 Finding your active listings...");
  const myActiveListings: number[] = [];

  for (let i = 1; i <= totalListings; i++) {
    try {
      const listing = await marketplace.listings(i);
      if (listing.active && listing.seller.toLowerCase() === signer.address.toLowerCase()) {
        myActiveListings.push(i);
        console.log(`  ✓ Found listing ${i}: ${listing.amount.toString()} shares, Token ID ${listing.tokenId.toString()}`);
      }
    } catch (error) {
      // Skip if listing doesn't exist
      continue;
    }
  }

  // Get listing IDs from environment variable or use found listings
  let listingIds: number[] = [];
  
  if (process.env.LISTING_IDS) {
    listingIds = process.env.LISTING_IDS.split(',').map(id => parseInt(id.trim()));
  } else if (myActiveListings.length > 0) {
    console.log(`\n✅ Found ${myActiveListings.length} active listing(s) owned by you`);
    listingIds = myActiveListings;
  } else {
    console.log("\n⚠️  No active listings found for your address");
    console.log("\nTo cancel specific listings, set environment variable:");
    console.log('  LISTING_IDS="1,2,3" npx hardhat run scripts/cancel-old-listings.ts --network arbitrumSepolia');
    process.exit(0);
  }


  // Check each listing before cancelling
  for (const listingId of listingIds) {
    try {
      console.log(`\n🔍 Checking listing ${listingId}...`);
      const listing = await marketplace.listings(listingId);
      
      console.log("Listing details:", {
        seller: listing.seller,
        tokenId: listing.tokenId.toString(),
        amount: listing.amount.toString(),
        pricePerShare: ethers.formatUnits(listing.pricePerShare, 6),
        active: listing.active
      });

      // Check if listing is active
      if (!listing.active) {
        console.log(`⚠️  Listing ${listingId} is already inactive`);
        continue;
      }

      // Check if signer is the seller
      if (listing.seller.toLowerCase() !== signer.address.toLowerCase()) {
        console.log(`❌ Listing ${listingId} belongs to ${listing.seller}, not ${signer.address}`);
        console.log(`   You can only cancel your own listings`);
        console.log(`   💡 To cancel this listing, set SELLER_PRIVATE_KEY env variable with the seller's private key`);
        continue;
      }

      // Cancel the listing (connect with signer)
      console.log(`\n🔄 Cancelling listing ${listingId}...`);
      const marketplaceWithSigner = marketplace.connect(signer);
      const tx = await marketplaceWithSigner.cancelListing(listingId);
      console.log(`   Transaction hash: ${tx.hash}`);
      
      console.log(`   Waiting for confirmation...`);
      const receipt = await tx.wait();
      
      console.log(`✅ Listing ${listingId} cancelled successfully!`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`   Block number: ${receipt.blockNumber}`);
      console.log(`   Transaction hash: ${receipt.hash}`);
      
      // Note: Database will be updated by indexer or you can manually update via API
      console.log(`   💡 Update database: POST /api/marketplace/cancel with listingId: ${listingId}`);
      
    } catch (error: any) {
      console.error(`❌ Error cancelling listing ${listingId}:`, error.message);
      if (error.reason) {
        console.error(`   Reason: ${error.reason}`);
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 CANCELLATION SUMMARY");
  console.log("=".repeat(60));
  console.log("Old Marketplace:", OLD_MARKETPLACE_ADDRESS);
  console.log("Seller address:", signer.address);
  console.log("Total listings found:", myActiveListings.length);
  console.log("Listings cancelled:", listingIds.length);
  console.log("=".repeat(60));
  console.log("\n💡 Next steps:");
  console.log("1. Update database status via API: POST /api/marketplace/cancel");
  console.log("2. Or wait for indexer to sync the cancellation");
  console.log("3. Shares have been returned to your wallet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

