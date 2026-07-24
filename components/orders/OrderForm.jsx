// components/orders/OrderForm.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import CurrencyInput from '@/components/CurrencyInput'
import {
  PhotoIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  DocumentTextIcon,
  UserIcon,
  UserPlusIcon,
  XMarkIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/16/solid'

const ROLE_LABELS = {
  manager: 'Менеджер',
  measurer: 'Замерщик',
  assembler: 'Сборщик'
}

const ROLE_CONFIG = {
  manager: {
    label: 'Менеджер',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    icon: BriefcaseIcon
  },
  measurer: {
    label: 'Замерщик',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/20',
    icon: WrenchScrewdriverIcon
  },
  assembler: {
    label: 'Сборщик',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/20',
    icon: TruckIcon
  }
}

export default function OrderForm({ order = null, isEdit = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [images, setImages] = useState(order?.images || [])
  const [participants, setParticipants] = useState([])  // Инициализируем пустым массивом
  const [newParticipant, setNewParticipant] = useState({ userId: '', role: 'manager' })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    status: 'new',
    priority: 'medium',
    date: '',
    deliveryDate: '',
    assemblyDate: '',
    totalAmount: '',
    clientId: '',
  })

  useEffect(() => {
    fetchClients()
    fetchUsers()

    if (order) {
      console.log('📦 Order data:', order) // Для отладки
      console.log('👥 Participants:', order.participants || order.order_participants) // Для отладки

      setFormData({
        title: order.title || '',
        description: order.description || '',
        address: order.address || '',
        status: order.status || 'new',
        priority: order.priority || 'medium',
        date: order.date ? new Date(order.date).toISOString().split('T')[0] : '',
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
        assemblyDate: order.assemblyDate ? new Date(order.assemblyDate).toISOString().split('T')[0] : '',
        totalAmount: order.totalAmount || '',
        clientId: order.clientId || '',
      })

      if (order.images && order.images.length > 0) {
        setImages(order.images)
      }

      // Инициализация участников
      const participantsData = order.participants || order.order_participants || []
      if (participantsData.length > 0) {
        console.log('✅ Setting participants:', participantsData)
        setParticipants(participantsData)
      }
    }
  }, [order])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to fetch clients')
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTotalChange = (rawValue) => {
    setFormData(prev => ({ ...prev, totalAmount: rawValue }))
  }

  const handleImagesChange = (newImages) => {
    setImages(newImages)
  }

  const handleAddParticipant = () => {
    if (!newParticipant.userId) {
      alert('Выберите пользователя')
      return
    }

    const user = users.find(u => u.id === newParticipant.userId)
    if (!user) return

    // Проверяем, не добавлен ли уже этот пользователь с такой же ролью
    const existing = participants.find(
      p => p.userId === newParticipant.userId && p.role === newParticipant.role
    )
    if (existing) {
      alert('Этот пользователь уже назначен на эту роль')
      return
    }

    setParticipants([
      ...participants,
      {
        id: `temp-${Date.now()}`,
        userId: newParticipant.userId,
        role: newParticipant.role,
        user: { name: user.name }
      }
    ])

    setNewParticipant({ userId: '', role: 'manager' })
  }

  const handleRemoveParticipant = (participantId) => {
    setParticipants(participants.filter(p => p.id !== participantId))
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
        deliveryDate: formData.deliveryDate || null,
        assemblyDate: formData.assemblyDate || null,
        participants: participants.map(p => ({
          userId: p.userId,
          role: p.role
        }))
      }

      console.log('📤 Sending participants:', submitData.participants) // Для отладки

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
      router.push(`/order/${data.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      alert(error.message || 'Ошибка при сохранении заказа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="border-b border-white/10 pb-12">
        <h2 className="text-base/7 font-semibold text-white">
          {isEdit ? 'Редактирование заказа' : 'Создание заказа'}
        </h2>
        <p className="mt-1 text-sm/6 text-gray-400">
          {isEdit ? 'Измените информацию о заказе' : 'Заполните информацию о новом заказе'}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {/* Название заказа */}
          <div className="sm:col-span-4">
            <label htmlFor="title" className="block text-sm/6 font-medium text-white">
              Название заказа <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <TagIcon className="size-5 text-gray-400 shrink-0" />
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Введите название заказа"
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>

          {/* Клиент */}
          <div className="sm:col-span-3">
            <label htmlFor="clientId" className="block text-sm/6 font-medium text-white">
              Клиент
            </label>
            <div className="mt-2 grid grid-cols-1">
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="">Без клиента</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
              />
            </div>
          </div>

          {/* Статус */}
          <div className="sm:col-span-2">
            <label htmlFor="status" className="block text-sm/6 font-medium text-white">
              Статус
            </label>
            <div className="mt-2 grid grid-cols-1">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="new">Новый</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Выполнен</option>
                <option value="cancelled">Отменён</option>
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
              />
            </div>
          </div>

          {/* Приоритет */}
          <div className="sm:col-span-2">
            <label htmlFor="priority" className="block text-sm/6 font-medium text-white">
              Приоритет
            </label>
            <div className="mt-2 grid grid-cols-1">
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
              />
            </div>
          </div>

          {/* Дата выполнения */}
          <div className="sm:col-span-2">
            <label htmlFor="date" className="block text-sm/6 font-medium text-white">
              Дата выполнения
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <CalendarIcon className="size-5 text-gray-400 shrink-0" />
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>

          {/* Дата сборки */}
          <div className="sm:col-span-2">
            <label htmlFor="assemblyDate" className="block text-sm/6 font-medium text-white">
              Дата сборки
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <CalendarIcon className="size-5 text-gray-400 shrink-0" />
                <input
                  id="assemblyDate"
                  name="assemblyDate"
                  type="date"
                  value={formData.assemblyDate}
                  onChange={handleChange}
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>

          {/* Дата доставки */}
          <div className="sm:col-span-2">
            <label htmlFor="deliveryDate" className="block text-sm/6 font-medium text-white">
              Дата доставки
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <CalendarIcon className="size-5 text-gray-400 shrink-0" />
                <input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>

          {/* Сумма */}
          <div className="sm:col-span-2">
            <label htmlFor="totalAmount" className="block text-sm/6 font-medium text-white">
              Сумма
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <CurrencyDollarIcon className="size-5 text-gray-400 shrink-0" />
                <CurrencyInput
                  id="totalAmount"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleTotalChange}
                  placeholder="0.00"
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>

          {/* Адрес */}
          <div className="col-span-full">
            <label htmlFor="address" className="block text-sm/6 font-medium text-white">
              📍 Адрес выполнения
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
                  placeholder="Введите адрес выполнения заказа"
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>

          {/* Описание */}
          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm/6 font-medium text-white">
              Описание
            </label>
            <div className="mt-2">
              <div className="flex rounded-md bg-white/5 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
                <DocumentTextIcon className="size-5 text-gray-400 shrink-0 m-3" />
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Подробное описание заказа..."
                  className="block w-full bg-transparent py-1.5 pr-3 pl-0 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Участники заказа */}
      <div className="border-b border-white/10 pb-12">
        <h2 className="text-base/7 font-semibold text-white">Участники заказа</h2>
        <p className="mt-1 text-sm/6 text-gray-400">
          Назначьте сотрудников на роли в заказе
        </p>

        <div className="mt-6">
          {/* Список участников */}
          {participants.length > 0 && (
            <div className="space-y-3 mb-4">
              {/* Группируем по ролям */}
              {Object.entries(
                participants.reduce((acc, p) => {
                  const role = p.role
                  if (!acc[role]) acc[role] = []
                  acc[role].push(p)
                  return acc
                }, {})
              ).map(([role, users]) => {
                const config = ROLE_CONFIG[role]
                if (!config) return null
                const Icon = config.icon

                return (
                  <div key={role} className="flex flex-wrap items-center gap-2">
                    {/* Бейдж роли */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
                      <Icon className={`size-3.5 ${config.textColor}`} />
                      <span className={`text-xs font-medium ${config.textColor}`}>
                        {config.label}
                      </span>
                      <span className={`text-xs ${config.textColor} opacity-60`}>
                        {users.length}
                      </span>
                    </div>

                    {/* Список пользователей */}
                    <div className="flex flex-wrap gap-1.5">
                      {users.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <UserIcon className="size-3 text-gray-400" />
                          <span className="text-sm text-white">
                            {p.user?.name || 'Пользователь'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(p.id)}
                            className="hover:text-red-400 transition-colors ml-0.5"
                          >
                            <XMarkIcon className="size-3.5 text-gray-400 hover:text-red-400 transition-colors" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Добавление участника */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4">
            <div className="flex-1 min-w-[150px]">
              <select
                value={newParticipant.userId}
                onChange={(e) => setNewParticipant({ ...newParticipant, userId: e.target.value })}
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="">Выберите пользователя</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[130px]">
              <select
                value={newParticipant.role}
                onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              >
                <option value="manager">Менеджер</option>
                <option value="measurer">Замерщик</option>
                <option value="assembler">Сборщик</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddParticipant}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
            >
              <UserPlusIcon className="size-4" />
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Изображения */}
      <div className="border-b border-white/10 pb-12">
        <h2 className="text-base/7 font-semibold text-white">Изображения</h2>
        <p className="mt-1 text-sm/6 text-gray-400">
          Добавьте фотографии, связанные с заказом
        </p>

        <div className="mt-10">
          <ImageUpload
            images={images}
            onImagesChange={handleImagesChange}
            targetId={order?.id}
            targetType="order"
          />
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
          {loading ? 'Сохранение...' : isEdit ? 'Обновить заказ' : 'Создать заказ'}
        </button>
      </div>
    </form>
  )
}