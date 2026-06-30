// components/orders/OrderForm.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'

export default function OrderForm({ order = null, isEdit = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [orderId, setOrderId] = useState(order?.id || null)
  const [images, setImages] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'new',
    priority: 'medium',
    date: '',
    totalAmount: '',
    clientId: '',
  })
  
  useEffect(() => {
    fetchClients()
    
    if (order) {
      setFormData({
        title: order.title || '',
        description: order.description || '',
        status: order.status || 'new',
        priority: order.priority || 'medium',
        date: order.date ? new Date(order.date).toISOString().split('T')[0] : '',
        totalAmount: order.totalAmount || '',
        clientId: order.clientId || '',
      })
      
      if (order.images && order.images.length > 0) {
        const formattedImages = order.images.map(img => {
          if (typeof img === 'string') {
            return { url: img, filename: 'Изображение' }
          }
          return img
        })
        setImages(formattedImages)
      } else {
        console.log('❌ No images found')
      }
    }
  }, [order])
  
  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) {
        throw new Error('Failed to fetch clients')
      }
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
    }
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleImagesChange = (newImages) => {
    setImages(newImages)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const submitData = {
        ...formData,
        clientId: formData.clientId || null,
        totalAmount: formData.totalAmount || null,
        date: formData.date || null,
      }
      
      const url = isEdit ? `/api/orders/${order.id}` : '/api/orders'
      const method = isEdit ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Ошибка при сохранении заказа')
      }
      
      const data = await res.json()
      
      // Если это новый заказ, обновляем orderId для загрузки изображений
      if (!isEdit && !orderId) {
        setOrderId(data.id)
        // Если есть изображения, загружаем их
        if (images.length > 0) {
          // Обновляем заказ с изображениями
          await fetch(`/api/orders/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: images.map(img => img.url || img) }),
          })
        }
      }
      
      router.push(`/order/${data.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      alert(error.message || 'Ошибка при сохранении заказа')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Название заказа <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Клиент</label>
          <select
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Без клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.phone ? `(${client.phone})` : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Статус</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="new">Новый</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Выполнен</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Приоритет</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Дата выполнения</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Сумма</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Загрузка изображений */}
      <div>
        <label className="block text-sm font-medium mb-1">Изображения</label>
        <ImageUpload
          images={images}
          onImagesChange={handleImagesChange}
          targetId={orderId || order?.id}
          targetType="order"
        />
      </div>
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : isEdit ? 'Обновить заказ' : 'Создать заказ'}
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}