import { Sequelize } from 'sequelize'
import pg from 'pg'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
})

// ** Временно для разработки: синхронизирует модели с БД **
// ВНИМАНИЕ: Не используй { force: true } в production, это удалит все данные!
await sequelize.sync({ force: true })

export { sequelize }