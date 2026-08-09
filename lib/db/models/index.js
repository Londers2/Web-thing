// lib/db/models/index.js
import { sequelize } from '../sequelize.js'
import initUser from './User.js'
import initAccount from './Account.js'
import initSession from './Session.js'
import initVerificationToken from './VerificationToken.js'
import initClient from './Client.js'
import initOrder from './Order.js'
import initImage from './Image.js'
import initOrderParticipant from './OrderParticipant.js'
import initAddress from './Address.js'
import initEvent from './Event.js'
import initEventParticipant from './EventParticipant.js'

let User, Account, Session, VerificationToken, Client, Order, Image, OrderParticipant, Address, Event, EventParticipant

export function initModels(sequelize) {
  User = initUser(sequelize)
  Account = initAccount(sequelize)
  Session = initSession(sequelize)
  VerificationToken = initVerificationToken(sequelize)
  Client = initClient(sequelize)
  Order = initOrder(sequelize)
  Image = initImage(sequelize)
  OrderParticipant = initOrderParticipant(sequelize)
  Address = initAddress(sequelize)
  Event = initEvent(sequelize)
  EventParticipant = initEventParticipant(sequelize)
  
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
  
  // Связи для Address
  Client.hasMany(Address, { foreignKey: 'clientId', onDelete: 'CASCADE' })
  Address.belongsTo(Client, { foreignKey: 'clientId' })
  
  // СВЯЗЬ: Order -> Address (добавляем!)
  Order.hasMany(Address, { foreignKey: 'orderId', onDelete: 'CASCADE' })
  Address.belongsTo(Order, { foreignKey: 'orderId' })
  
  // Связи для Event
  Order.hasMany(Event, { foreignKey: 'orderId', onDelete: 'CASCADE' })
  Event.belongsTo(Order, { foreignKey: 'orderId' })
  
  Address.hasMany(Event, { foreignKey: 'addressId', onDelete: 'SET NULL' })
  Event.belongsTo(Address, { foreignKey: 'addressId' })
  
  // Связи для EventParticipant
  Event.hasMany(EventParticipant, { foreignKey: 'eventId', onDelete: 'CASCADE' })
  EventParticipant.belongsTo(Event, { foreignKey: 'eventId' })
  User.hasMany(EventParticipant, { foreignKey: 'userId', onDelete: 'CASCADE' })
  EventParticipant.belongsTo(User, { foreignKey: 'userId' })
  
  // Связи для Image (полиморфные)
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
  
  Event.hasMany(Image, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'eventimages',
    scope: { targetType: 'event' }
  })
  Image.belongsTo(Event, {
    foreignKey: 'targetId',
    constraints: false,
    as: 'event',
    scope: { targetType: 'event' }
  })
  
  console.log('✅ Database models initialized')
  
  return { 
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
}

export { 
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