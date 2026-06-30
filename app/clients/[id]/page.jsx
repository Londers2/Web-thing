// app/clients/[id]/page.jsx
import Sidebar from '@/components/sidebar'
import { Client, Order } from '@/lib/db/index.js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ClientPage({ params }) {
  const { id } = await params
  
  const client = await Client.findByPk(id, {
    include: [
      {
        model: Order,
        as: 'orders',
        limit: 10,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'status', 'totalAmount', 'createdAt']
      }
    ]
  })
  
  if (!client) {
    notFound()
  }
  
  const clientData = client.get({ plain: true })
  
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  
  const statusLabels = {
    new: 'Новый',
    in_progress: 'В работе',
    completed: 'Выполнен',
    cancelled: 'Отменён',
  }
  
  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{clientData.name}</h1>
          <div className="flex gap-2">
            <Link
              href={`/clients/${clientData.id}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Редактировать
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientData.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Телефон</label>
                <p className="font-medium">{clientData.phone}</p>
              </div>
            )}
            
            {clientData.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Адрес</label>
                <p className="font-medium">{clientData.address}</p>
              </div>
            )}
          </div>
          
          {clientData.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Заметки</label>
              <p className="mt-1 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {clientData.notes}
              </p>
            </div>
          )}
          
          {clientData.orders && clientData.orders.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Заказы</label>
              <div className="mt-2 space-y-2">
                {clientData.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order/${order.id}`}
                    className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{order.title}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                      {order.totalAmount && (
                        <span>{Number(order.totalAmount).toLocaleString()} ₽</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  )
}