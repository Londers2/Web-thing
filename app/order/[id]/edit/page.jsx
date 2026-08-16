// app/order/[id]/edit/page.jsx
import OrderForm from '@/components/orders/OrderForm'
import { Order, Client, Image, OrderParticipant, User, Address, Event } from '@/lib/db/index.js'
import { notFound } from 'next/navigation'

export default async function EditOrderPage({ params }) {
  const { id } = await params
  
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
        model: Address,
        attributes: ['id', 'city', 'street', 'house', 'entrance', 'floor', 'apartment', 'intercom', 'isDefault']
      },
      {
        model: Event,
        attributes: ['id', 'type', 'status', 'scheduledDate', 'description', 'addressId'],
        include: [
          {
            model: Address,
            attributes: ['id', 'city', 'street', 'house']
          }
        ]
      }
    ],
  })
  
  if (!order) {
    notFound()
  }
  
  const orderData = order.get({ plain: true })
  
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