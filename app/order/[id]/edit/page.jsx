// app/order/[id]/edit/page.jsx
import OrderForm from '@/components/orders/OrderForm'
import { Order, Client, Image, OrderParticipant, User, Address, Event } from '@/lib/db/index.js'
import { notFound } from 'next/navigation'

export default async function EditOrderPage({ params }) {
  const { id } = await params

  // ВАЖНО: добавляем все необходимые include
  const order = await Order.findByPk(id, {
    include: [
      { model: Client },
      {
        model: Image,
        as: 'images',
        required: false,
        attributes: ['id', 'url', 'filename', 'sortOrder']
      },
      {
        model: OrderParticipant,
        include: [{
          model: User,
          attributes: ['id', 'name', 'email', 'image']
        }]
      },
      {
        model: Address,  // <-- Добавляем адреса
        attributes: ['id', 'title', 'address', 'city', 'entrance', 'floor', 'apartment', 'intercom', 'comment', 'isDefault']
      },
      {
        model: Event,    // <-- Добавляем события
        attributes: ['id', 'type', 'status', 'scheduledDate', 'title', 'description', 'addressId'],
        include: [
          {
            model: Address,
            attributes: ['id', 'title', 'address']
          }
        ]
      }
    ],
  })

  if (!order) {
    notFound()
  }

  const orderData = order.get({ plain: true })

  // Логируем для проверки
  console.log('📝 Редактирование заказа:', {
    id: orderData.id,
    title: orderData.title,
    addressesCount: orderData.addresses?.length || 0,
    eventsCount: orderData.events?.length || 0,
  })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-6">Редактирование заказа</h1>
      <OrderForm order={orderData} isEdit />
    </div>
  )
}