// app/order/[id]/edit/page.jsx
import Sidebar from '@/components/sidebar'
import OrderForm from '@/components/orders/OrderForm'
import { Order, Client, Image, OrderParticipant, User } from '@/lib/db/index.js'
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
        include: [{ model: User, attributes: ['id', 'name', 'email', 'image'] }]
      }
    ],
  })
  
  if (!order) {
    notFound()
  }
  
  const orderData = order.get({ plain: true })
  
  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto">
        {/* <h1 className="text-2xl font-semibold text-white mb-6">Редактирование заказа</h1> */}
        <OrderForm order={orderData} isEdit />
      </div>
    </Sidebar>
  )
}