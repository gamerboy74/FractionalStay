const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Checking contracts with account:", deployer.address);

  // Contract addresses
  const MARKETPLACE_ADDRESS = "0x9679087b60Cf6f87E14342114B921707B099947d";
  const REVENUE_SPLITTER_ADDRESS = "0x21dd5419Da6C7FE827F0ca7eAbb219c64f6E8033";
  const USDC_ADDRESS = "0x87917eE5e87Ed830F3D26A14Df3549f6A6Aa332C";

  // Get contract instances
  const Marketplace = await hre.ethers.getContractAt("Marketplace", MARKETPLACE_ADDRESS);
  const RevenueSplitter = await hre.ethers.getContractAt("RevenueSplitter", REVENUE_SPLITTER_ADDRESS);
  const USDC = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);

  // Check Marketplace
  console.log("\n=== MARKETPLACE ===");
  const marketplaceFeeBps = await Marketplace.marketplaceFeeBps();
  const marketplaceFeeRecipient = await Marketplace.feeRecipient();
  const marketplaceOwner = await Marketplace.owner();
  const marketplaceUSDCBalance = await USDC.balanceOf(MARKETPLACE_ADDRESS);

  console.log("Fee BPS:", marketplaceFeeBps.toString(), "(2.5%)");
  console.log("Fee Recipient:", marketplaceFeeRecipient);
  console.log("Owner:", marketplaceOwner);
  console.log("USDC Balance:", hre.ethers.formatUnits(marketplaceUSDCBalance, 6), "USDC");

  // Check RevenueSplitter
  console.log("\n=== REVENUE SPLITTER ===");
  const platformFeeBps = await RevenueSplitter.platformFeeBps();
  const platformFeeRecipient = await RevenueSplitter.feeRecipient();
  const revenueSplitterOwner = await RevenueSplitter.owner();
  const revenueSplitterUSDCBalance = await USDC.balanceOf(REVENUE_SPLITTER_ADDRESS);

  console.log("Fee BPS:", platformFeeBps.toString(), "(1%)");
  console.log("Fee Recipient:", platformFeeRecipient);
  console.log("Owner:", revenueSplitterOwner);
  console.log("USDC Balance:", hre.ethers.formatUnits(revenueSplitterUSDCBalance, 6), "USDC");

  // Check deployer's USDC balance
  const deployerUSDCBalance = await USDC.balanceOf(deployer.address);
  console.log("\n=== DEPLOYER ===");
  console.log("USDC Balance:", hre.ethers.formatUnits(deployerUSDCBalance, 6), "USDC");

  console.log("\n=== SUMMARY ===");
  console.log("If fee recipient is your wallet, fees are already there.");
  console.log("If fee recipient is a contract address, fees are stuck in that contract.");
  console.log("You can call setFeeRecipient() to change it to your wallet for future fees.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });