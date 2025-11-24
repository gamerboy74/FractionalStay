import hre from 'hardhat'

async function main() {
  const PropertyShare1155 = await hre.ethers.getContractAt(
    'PropertyShare1155',
    '0x3809c6480Fde57d20522778514DacACb073c96ba'
  )

  const wallet = '0xbae9b8b0b94ad045b0e3edb2b56cfecd7601cf53'
  
  console.log('\n📊 Checking shares on blockchain...\n')
  console.log(`Wallet: ${wallet}\n`)
  
  // Get total property count
  const propertyCount = await PropertyShare1155.propertyCount()
  console.log(`Total properties created: ${propertyCount}\n`)
  
  // Check all properties up to ID 10
  for (let i = 0; i < 10; i++) {
    const balance = await PropertyShare1155.balanceOf(wallet, i)
    const property = await PropertyShare1155.properties(i)
    
    console.log(`Property ID ${i}:`)
    console.log(`  Exists: ${property.exists}`)
    console.log(`  Name: ${property.name}`)
    console.log(`  Shares owned by wallet: ${balance}`)
    
    if (balance > 0n) {
      console.log(`  ✅ HAS SHARES!`)
    }
    console.log()
  }
  
  console.log('\n✅ Done\n')
  process.exit(0)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
