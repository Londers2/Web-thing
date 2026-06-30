// components/orders/OrderList.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function OrderList() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    fetchOrders()
  }, [filter, search])
  
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (search) params.append('search', search)
      
      const res = await fetch(`/api/orders?${params}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Ошибка загрузки заказов')
      }
      
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error.message || 'Ошибка загрузки заказов')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  
  const getStatusLabel = (status) => {
    const labels = {
      new: 'Новый',
      in_progress: 'В работе',
      completed: 'Выполнен',
      cancelled: 'Отменён',
    }
    return labels[status] || status
  }
  
  if (loading) {
    return <div className="text-center py-8">Загрузка заказов...</div>
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Ошибка: {error}</p>
        <button 
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Повторить попытку
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск заказов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Все заказы</option>
          <option value="new">Новые</option>
          <option value="in_progress">В работе</option>
          <option value="completed">Выполненные</option>
          <option value="cancelled">Отменённые</option>
        </select>
        
        <Link
          href="/order/new"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Создать заказ
        </Link>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">Заказов пока нет</p>
          <Link href="/order/new" className="mt-4 inline-block text-blue-600 hover:underline">
            Создать первый заказ
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <Link href={`/order/${order.id}`}>
                    <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                      {order.title}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {order.description || 'Нет описания'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    
                    {order.priority === 'high' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        ⚠ Высокий приоритет
                      </span>
                    )}
                    {order.priority === 'low' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Низкий приоритет
                      </span>
                    )}
                    
                    {order.totalAmount && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {Number(order.totalAmount).toLocaleString()} ₽
                      </span>
                    )}
                  </div>
                  
                  {/* ОТОБРАЖЕНИЕ КЛИЕНТА */}
                  {order.client ? (
                    <Link 
                      href={`/clients/${order.client.id}`}
                      className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      👤 {order.client.name}
                      {order.client.phone && ` · ${order.client.phone}`}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-400 mt-2">Без клиента</p>
                  )}
                  
                  {order.images && order.images.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {order.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                      ))}
                      {order.images.length > 3 && (
                        <span className="text-xs text-gray-500">+{order.images.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/order/${order.id}/edit`}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    Редактировать
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}