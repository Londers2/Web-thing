// lib/db/models/index.js
import { sequelize } from '../sequelize.js'
import initUser from './User.js'
import initAccount from './Account.js'
import initSession from './Session.js'
import initVerificationToken from './VerificationToken.js'
import initClient from './Client.js'
import initOrder from './Order.js'
import initImage from './Image.js'

let User, Account, Session, VerificationToken, Client, Order, Image

export function initModels() {
  User = initUser(sequelize)
  Account = initAccount(sequelize)
  Session = initSession(sequelize)
  VerificationToken = initVerificationToken(sequelize)
  Client = initClient(sequelize)
  Order = initOrder(sequelize)
  Image = initImage(sequelize)
  
  // Связи для Order
  User.hasMany(Order, { foreignKey: 'userId', onDelete: 'SET NULL' })
  Order.belongsTo(User, { foreignKey: 'userId' })
  
  Client.hasMany(Order, { foreignKey: 'clientId', onDelete: 'SET NULL' })
  Order.belongsTo(Client, { foreignKey: 'clientId' })
  
  // Связи для Image - убираем scope, чтобы не было двойного условия
  User.hasMany(Image, { 
    foreignKey: 'userId', 
    constraints: false,
    as: 'userimages'
  })
  Image.belongsTo(User, { 
    foreignKey: 'userId', 
    constraints: false,
    as: 'user'
  })
  
  Order.hasMany(Image, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'images',
    scope: { targetType: 'order' }
  })
  Image.belongsTo(Order, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'order',
    scope: { targetType: 'order' }
  })
  
  Client.hasMany(Image, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'clientimages'
  })
  Image.belongsTo(Client, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'client'
  })
  
  console.log('✅ Database models initialized')
  
  return { User, Account, Session, VerificationToken, Client, Order, Image }
}