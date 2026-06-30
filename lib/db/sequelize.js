// lib/db/sequelize.js
import { Sequelize } from 'sequelize'
import pg from 'pg'

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

export { sequelize }