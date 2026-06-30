import { User, Account, Session, VerificationToken } from './index.js'

// Определяем связи
User.hasMany(Account, { foreignKey: 'userId', onDelete: 'CASCADE' })
Account.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Session, { foreignKey: 'userId', onDelete: 'CASCADE' })
Session.belongsTo(User, { foreignKey: 'userId' })

// VerificationToken не имеет связей с User (по стандарту next-auth)

console.log('✅ Database associations defined')