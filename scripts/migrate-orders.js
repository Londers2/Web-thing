// scripts/migrate-orders.js
import { sequelize, Order, Address, Event, Client } from '../lib/db/index.js'

async function migrateOrders() {
  const orders = await Order.findAll({
    include: [{ model: Client }]
  })

  for (const order of orders) {
    // Создаём адрес из данных заказа
    if (order.address) {
      const address = await Address.create({
        clientId: order.clientId,
        address: order.address,
        isDefault: true,
        title: 'Основной адрес'
      })

      // Создаём события для каждой даты
      const events = []
      
      if (order.date) {
        events.push({
          orderId: order.id,
          addressId: address.id,
          type: 'assembly',
          scheduledDate: order.date,
          status: order.status === 'completed' ? 'completed' : 'pending',
          title: `Сборка: ${order.title}`
        })
      }
      
      if (order.deliveryDate) {
        events.push({
          orderId: order.id,
          addressId: address.id,
          type: 'delivery',
          scheduledDate: order.deliveryDate,
          status: order.status === 'completed' ? 'completed' : 'pending',
          title: `Доставка: ${order.title}`
        })
      }

      await Event.bulkCreate(events)
    }
  }

  console.log('✅ Миграция завершена')
}

migrateOrders().catch(console.error)