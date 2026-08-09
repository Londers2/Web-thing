// lib/db/index.js
import { sequelize } from './sequelize.js'
import { initModels } from './models/index.js'

const { 
  User, 
  Account, 
  Session, 
  VerificationToken, 
  Client, 
  Order, 
  Image, 
  OrderParticipant,
  Address,
  Event,
  EventParticipant
} = initModels(sequelize)

export { 
  sequelize, 
  User, 
  Account, 
  Session, 
  VerificationToken, 
  Client, 
  Order, 
  Image, 
  OrderParticipant,
  Address,
  Event,
  EventParticipant
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