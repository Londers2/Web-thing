// components/clients/ClientForm.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PhoneInput from '@/components/PhoneInput'
import { 
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function ClientForm({ client = null, isEdit = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  })
  
  // Инициализация данных при монтировании
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || '',
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        notes: '',
      })
    }
  }, [client])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePhoneChange = (rawValue) => {
    // rawValue — это чистый номер без форматирования
    setFormData(prev => ({ ...prev, phone: rawValue || '' }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // phone уже хранится в чистом виде
      const submitData = {
        name: formData.name,
        phone: formData.phone || '',
        address: formData.address || '',
        notes: formData.notes || '',
      }
      
      const url = isEdit ? `/api/clients/${client.id}` : '/api/clients'
      const method = isEdit ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Ошибка при сохранении клиента')
      }
      
      const data = await res.json()
      router.push(`/clients/${data.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      alert(error.message || 'Ошибка при сохранении клиента')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="border-b border-white/10 pb-12">
        <h2 className="text-base/7 font-semibold text-white">
          {isEdit ? 'Редактирование клиента' : 'Добавление клиента'}
        </h2>
        <p className="mt-1 text-sm/6 text-gray-400">
          {isEdit ? 'Измените информацию о клиенте' : 'Заполните информацию о новом клиенте'}
        </p>
        
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {/* Имя клиента */}
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm/6 font-medium text-white">
              Имя клиента <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <UserIcon className="size-5 text-gray-400 shrink-0" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Введите имя клиента"
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>
          
          {/* Телефон с PhoneInput */}
          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm/6 font-medium text-white">
              Телефон
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <PhoneIcon className="size-5 text-gray-400 shrink-0" />
                <PhoneInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>
          
          {/* Адрес */}
          <div className="col-span-full">
            <label htmlFor="address" className="block text-sm/6 font-medium text-white">
              Адрес
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <MapPinIcon className="size-5 text-gray-400 shrink-0" />
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Введите адрес клиента"
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>
          
          {/* Заметки */}
          <div className="col-span-full">
            <label htmlFor="notes" className="block text-sm/6 font-medium text-white">
              Заметки
            </label>
            <div className="mt-2">
              <div className="flex rounded-md bg-white/5 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <DocumentTextIcon className="size-5 text-gray-400 shrink-0 m-3" />
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Дополнительная информация о клиенте..."
                  className="block w-full bg-transparent py-1.5 pr-3 pl-0 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Кнопки */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm/6 font-semibold text-white hover:text-gray-300"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Сохранение...' : isEdit ? 'Обновить клиента' : 'Создать клиента'}
        </button>
      </div>
    </form>
  )
}