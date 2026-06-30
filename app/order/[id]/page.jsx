// app/order/[id]/page.jsx
import Sidebar from '@/components/sidebar'
import { Order, Client, Image } from '@/lib/db/index.js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function OrderPage({ params }) {
  const { id } = await params
  
  const order = await Order.findByPk(id, {
    include: [
      { model: Client },
      { 
        model: Image,
        as: 'images',
        where: { targetType: 'order' },
        required: false,
        attributes: ['id', 'url', 'filename', 'sortOrder']
      }
    ],
  })
  
  if (!order) {
    notFound()
  }
  
  const orderData = order.get({ plain: true })
  
  const statusLabels = {
    new: 'Новый',
    in_progress: 'В работе',
    completed: 'Выполнен',
    cancelled: 'Отменён',
  }
  
  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  }
  
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  
  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{orderData.title}</h1>
          <div className="flex gap-2">
            <Link
              href={`/order/${orderData.id}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Редактировать
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Статус</label>
              <p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[orderData.status]}`}>
                  {statusLabels[orderData.status] || orderData.status}
                </span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Приоритет</label>
              <p className="font-medium">
                {priorityLabels[orderData.priority] || orderData.priority}
              </p>
            </div>
            
            {orderData.date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Дата выполнения</label>
                <p>{new Date(orderData.date).toLocaleDateString('ru-RU')}</p>
              </div>
            )}
            
            {orderData.totalAmount && (
              <div>
                <label className="text-sm font-medium text-gray-500">Сумма</label>
                <p className="font-semibold">{Number(orderData.totalAmount).toLocaleString()} ₽</p>
              </div>
            )}
            
            {orderData.client && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Клиент</label>
                <p className="font-medium">
                  {orderData.client.name}
                  {orderData.client.phone && ` · ${orderData.client.phone}`}
                  {orderData.client.address && ` · ${orderData.client.address}`}
                </p>
              </div>
            )}
          </div>
          
          {orderData.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Описание</label>
              <p className="mt-1 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {orderData.description}
              </p>
            </div>
          )}
          
          {orderData.images && orderData.images.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Изображения</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {orderData.images.map((image) => (
                  <a
                    key={image.id}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={image.url}
                      alt={image.filename || 'Изображение'}
                      className="w-32 h-32 object-cover rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Создан: {new Date(orderData.createdAt).toLocaleString('ru-RU')}
            </p>
            {orderData.updatedAt && orderData.updatedAt !== orderData.createdAt && (
              <p className="text-sm text-gray-500">
                Обновлён: {new Date(orderData.updatedAt).toLocaleString('ru-RU')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  )
}