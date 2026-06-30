import { Sequelize } from 'sequelize'
import pg from 'pg'
import { initModels } from './models/index.js'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

// Инициализируем модели
const { User, Account, Session, VerificationToken, Client, Order, Image } = initModels(sequelize)

// Экспортируем sequelize и все модели
export { 
  sequelize, 
  User, 
  Account, 
  Session, 
  VerificationToken, 
  Client, 
  Order, 
  Image 
}

// Функции для работы с БД
export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ PostgreSQL connected successfully')
    return true
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error)
    return false
  }
}

export async function syncDatabase(options = { alter: true }) {
  try {
    await sequelize.sync(options)
    console.log('✅ Database synchronized successfully')
  } catch (error) {
    console.error('❌ Database sync error:', error)
    throw error
  }
}