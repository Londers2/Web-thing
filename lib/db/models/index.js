import initUser from './User.js'
import initAccount from './Account.js'
import initSession from './Session.js'
import initVerificationToken from './VerificationToken.js'
import initClient from './Client.js'
import initOrder from './Order.js'
import initImage from './Image.js'
import initOrderParticipant from './OrderParticipant.js'

let User, Account, Session, VerificationToken, Client, Order, Image, OrderParticipant

export function initModels(sequelize) {
  User = initUser(sequelize)
  Account = initAccount(sequelize)
  Session = initSession(sequelize)
  VerificationToken = initVerificationToken(sequelize)
  Client = initClient(sequelize)
  Order = initOrder(sequelize)
  Image = initImage(sequelize)
  OrderParticipant = initOrderParticipant(sequelize)
  
  // Связи для Order
  User.hasMany(Order, { foreignKey: 'userId', onDelete: 'SET NULL' })
  Order.belongsTo(User, { foreignKey: 'userId' })
  
  Client.hasMany(Order, { foreignKey: 'clientId', onDelete: 'SET NULL' })
  Order.belongsTo(Client, { foreignKey: 'clientId' })
  
  // Связи для OrderParticipant
  Order.hasMany(OrderParticipant, { foreignKey: 'orderId', onDelete: 'CASCADE' })
  OrderParticipant.belongsTo(Order, { foreignKey: 'orderId' })
  
  User.hasMany(OrderParticipant, { foreignKey: 'userId', onDelete: 'CASCADE' })
  OrderParticipant.belongsTo(User, { foreignKey: 'userId' })
  
  // Связи для Image
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
    as: 'images'
  })
  Image.belongsTo(Order, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'order'
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
  
  return { User, Account, Session, VerificationToken, Client, Order, Image, OrderParticipant }
}

export { User, Account, Session, VerificationToken, Client, Order, Image, OrderParticipant }