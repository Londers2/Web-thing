// app/order/[id]/edit/page.jsx
import Sidebar from '@/components/sidebar'
import OrderForm from '@/components/orders/OrderForm'
import { Order, Client, Image } from '@/lib/db/index.js'
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
      }
    ],
  })
  
  if (!order) {
    notFound()
  }
  
  // Преобразуем в обычный объект
  const orderData = order.get({ plain: true })
  
  // ПРОВЕРКА: если images есть, но это массив строк, преобразуем
  if (orderData.images && orderData.images.length > 0) {
    orderData.images = orderData.images.map(img => ({
      id: img.id,
      url: img.url || img,
      filename: img.filename || 'Изображение'
    }))
  }
  
  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Редактирование заказа</h1>
        <OrderForm order={orderData} isEdit />
      </div>
    </Sidebar>
  )
}