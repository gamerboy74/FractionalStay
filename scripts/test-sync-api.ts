import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../frontend/.env.local') })

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testSyncAPI(listingId: number) {
  console.log(`🧪 Testing sync API for listing ${listingId}...\n`)

  try {
    const response = await fetch(`${API_URL}/api/marketplace/sync-from-blockchain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Response:')
      console.log(JSON.stringify(data, null, 2))
      console.log('\n✅ Listing synced successfully via new API endpoint!')
    } else {
      const error = await response.text()
      console.error('❌ API Error:', response.status, error)
    }
  } catch (error: any) {
    console.error('❌ Error calling API:', error.message)
    console.log('\n💡 Make sure the Next.js dev server is running on port 3000')
  }
}

const listingId = process.argv[2] ? parseInt(process.argv[2]) : 1
testSyncAPI(listingId).catch(console.error)

