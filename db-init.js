// db-init.js
import dotenv from 'dotenv'
import { testConnection, syncDatabase } from './lib/db/index.js'

// Загружаем переменные окружения из .env.local
dotenv.config({ path: '.env.local' })

async function initDatabase() {
  console.log('🔄 Инициализация базы данных...')
  console.log('📌 DATABASE_URL:', process.env.DATABASE_URL ? '✅ задана' : '❌ не задана')
  
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('❌ Не удалось подключиться к базе данных')
    process.exit(1)
  }
  
  console.log('🔄 Создание/обновление таблиц...')
  await syncDatabase({ alter: true })
  
  console.log('✅ Инициализация базы данных завершена')
  process.exit(0)
}

initDatabase().catch(err => {
  console.error('❌ Критическая ошибка:', err)
  process.exit(1)
})