const hre = require("hardhat");

async function main() {
  const marketplaceAddress = "0x1213096b326408A556905A38bf1Dd209b06e5161";
  
  console.log("Checking Marketplace contract at:", marketplaceAddress);
  
  // Get contract code
  const code = await hre.ethers.provider.getCode(marketplaceAddress);
  
  if (code === "0x") {
    console.log("❌ No contract deployed at this address!");
  } else {
    console.log("✅ Contract exists at this address");
    console.log("Code length:", code.length, "bytes");
    
    // Try to get contract instance
    const Marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceAddress);
    
    try {
      const listingCount = await Marketplace.listingCount();
      console.log("Listing count:", listingCount.toString());
      
      const propertyToken = await Marketplace.propertyToken();
      console.log("Property Token address:", propertyToken);
      
      const usdc = await Marketplace.usdc();
      console.log("USDC address:", usdc);
    } catch (error) {
      console.error("Error calling contract methods:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
