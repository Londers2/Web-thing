import { testConnection, syncDatabase } from '@/lib/db/index.js'

async function initDatabase() {
  console.log('Initializing database...')
  
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('Failed to connect to database')
    process.exit(1)
  }
  
  await syncDatabase({ alter: true })
  console.log('Database initialization complete')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
}