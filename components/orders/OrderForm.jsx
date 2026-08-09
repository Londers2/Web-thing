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
  TruckIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon,
  HomeIcon,
  BuildingOffice2Icon,
  PencilIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { EVENT_TYPES, EVENT_STATUSES } from '@/lib/constants/eventTypes'

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
  const [participants, setParticipants] = useState([])
  const [newParticipant, setNewParticipant] = useState({ userId: '', role: 'manager' })
  const [addresses, setAddresses] = useState([])
  const [events, setEvents] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'new',
    priority: 'medium',
    totalAmount: '',
    clientId: '',
  })

  // Состояния для добавления адреса
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '',
    city: '',
    entrance: '',
    floor: '',
    apartment: '',
    intercom: '',
    comment: '',
    isDefault: false,
  })

  // Состояния для добавления события
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    type: 'measurement',
    status: 'pending',
    scheduledDate: '',
    title: '',
    description: '',
    addressId: '',
  })

  useEffect(() => {
    fetchClients()
    fetchUsers()

    if (order) {
      setFormData({
        title: order.title || '',
        description: order.description || '',
        status: order.status || 'new',
        priority: order.priority || 'medium',
        totalAmount: order.totalAmount || '',
        clientId: order.clientId || '',
      })

      if (order.images && order.images.length > 0) {
        setImages(order.images)
      }

      if (order.order_participants) {
        setParticipants(order.order_participants)
      }

      if (order.addresses) {
        setAddresses(order.addresses)
      }

      if (order.events) {
        setEvents(order.events)
      }
    }
  }, [order])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to fetch clients')
      const data = await res.json()
      setClients(Array.isArray(data) ? data : data.data || [])
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

  // Управление адресами
  const handleAddAddress = () => {
    if (!newAddress.address.trim()) {
      alert('Введите адрес')
      return
    }

    setAddresses([
      ...addresses,
      {
        id: `temp-${Date.now()}`,
        ...newAddress,
        isDefault: addresses.length === 0 ? true : newAddress.isDefault
      }
    ])

    setNewAddress({
      title: '',
      address: '',
      city: '',
      entrance: '',
      floor: '',
      apartment: '',
      intercom: '',
      comment: '',
      isDefault: false,
    })
    setShowAddressForm(false)
  }

  const handleRemoveAddress = (addressId) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId))
  }

  const handleSetDefaultAddress = (addressId) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })))
  }

  // Управление событиями
  const handleAddEvent = () => {
    if (!newEvent.scheduledDate) {
      alert('Выберите дату')
      return
    }

    setEvents([
      ...events,
      {
        id: `temp-${Date.now()}`,
        ...newEvent,
        addressId: newEvent.addressId || null,
      }
    ])

    setNewEvent({
      type: 'measurement',
      status: 'pending',
      scheduledDate: '',
      title: '',
      description: '',
      addressId: '',
    })
    setShowEventForm(false)
  }

  const handleRemoveEvent = (eventId) => {
    setEvents(events.filter(ev => ev.id !== eventId))
  }

  const handleAddParticipant = () => {
    if (!newParticipant.userId) {
      alert('Выберите пользователя')
      return
    }

    const user = users.find(u => u.id === newParticipant.userId)
    if (!user) return

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
        user: { name: user.name, image: user.image }
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
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        totalAmount: formData.totalAmount || null,
        clientId: formData.clientId || null,
        addresses: addresses.map(addr => ({
          title: addr.title,
          address: addr.address,
          city: addr.city,
          entrance: addr.entrance,
          floor: addr.floor,
          apartment: addr.apartment,
          intercom: addr.intercom,
          comment: addr.comment,
          isDefault: addr.isDefault,
        })),
        events: events.map(event => ({
          type: event.type,
          status: event.status || 'pending',
          scheduledDate: event.scheduledDate,
          title: event.title || '',
          description: event.description || '',
          addressId: event.addressId || null,
        })),
        participants: participants.map(p => ({
          userId: p.userId,
          role: p.role,
        }))
      }

      console.log('📤 Отправка данных:', JSON.stringify(submitData, null, 2))

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

  const eventTypeOptions = Object.entries(EVENT_TYPES).map(([key, value]) => ({
    value: key,
    label: value.label,
    icon: value.icon,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Основная информация */}
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
                    {client.name} {client.phone ? `(${client.phone})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
              />
            </div>
          </div>

          {/* Сумма */}
          <div className="sm:col-span-3">
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
        </div>
      </div>

      {/* Адреса */}
      <div className="border-b border-white/10 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-5 text-gray-400" />
            <h2 className="text-base/7 font-semibold text-white">Адреса</h2>
            <span className="text-xs text-gray-500">({addresses.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddressForm(true)}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
          >
            <PlusIcon className="size-4" />
            Добавить адрес
          </button>
        </div>

        {/* Список адресов */}
        {addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">
                          Основной
                        </span>
                      )}
                      {addr.title && (
                        <span className="text-sm font-medium text-white">{addr.title}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{addr.address}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      {addr.city && <span>Город: {addr.city}</span>}
                      {addr.entrance && <span>Подъезд: {addr.entrance}</span>}
                      {addr.floor && <span>Этаж: {addr.floor}</span>}
                      {addr.apartment && <span>Кв: {addr.apartment}</span>}
                      {addr.intercom && <span>Домофон: {addr.intercom}</span>}
                    </div>
                    {addr.comment && (
                      <p className="text-xs text-gray-500 mt-1">{addr.comment}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Сделать основным
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Форма добавления адреса */}
        {showAddressForm && (
          <div className="mt-4 bg-white/5 rounded-lg p-4 border border-indigo-500/20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-white">Новый адрес</h3>
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Название</label>
                <input
                  type="text"
                  value={newAddress.title}
                  onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                  placeholder="Дом, офис, склад..."
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Адрес *</label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="Улица, дом..."
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Город</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="Город"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Подъезд</label>
                <input
                  type="text"
                  value={newAddress.entrance}
                  onChange={(e) => setNewAddress({ ...newAddress, entrance: e.target.value })}
                  placeholder="Подъезд"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Этаж</label>
                <input
                  type="text"
                  value={newAddress.floor}
                  onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                  placeholder="Этаж"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Квартира</label>
                <input
                  type="text"
                  value={newAddress.apartment}
                  onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                  placeholder="Квартира"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Домофон</label>
                <input
                  type="text"
                  value={newAddress.intercom}
                  onChange={(e) => setNewAddress({ ...newAddress, intercom: e.target.value })}
                  placeholder="Код домофона"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Комментарий</label>
                <input
                  type="text"
                  value={newAddress.comment}
                  onChange={(e) => setNewAddress({ ...newAddress, comment: e.target.value })}
                  placeholder="Дополнительная информация"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                className="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-400">
                Сделать основным адресом
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddAddress}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
            >
              Добавить адрес
            </button>
          </div>
        )}
      </div>

      {/* События */}
      <div className="border-b border-white/10 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="size-5 text-gray-400" />
            <h2 className="text-base/7 font-semibold text-white">События</h2>
            <span className="text-xs text-gray-500">({events.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowEventForm(true)}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
          >
            <PlusIcon className="size-4" />
            Добавить событие
          </button>
        </div>

        {/* Список событий */}
        {events.length > 0 && (
          <div className="space-y-3">
            {events.map((event) => {
              const typeInfo = EVENT_TYPES[event.type]
              return (
                <div key={event.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${typeInfo?.color || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {typeInfo?.icon} {typeInfo?.label || event.type}
                        </span>
                        {event.title && (
                          <span className="text-sm font-medium text-white">{event.title}</span>
                        )}
                        {event.scheduledDate && (
                          <span className="text-xs text-gray-400">
                            {new Date(event.scheduledDate).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                      )}
                      {event.addressId && addresses.find(a => a.id === event.addressId) && (
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {addresses.find(a => a.id === event.addressId)?.address}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(event.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Форма добавления события */}
        {showEventForm && (
          <div className="mt-4 bg-white/5 rounded-lg p-4 border border-indigo-500/20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-white">Новое событие</h3>
              <button
                type="button"
                onClick={() => setShowEventForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Тип события *</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                >
                  {eventTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Дата *</label>
                <input
                  type="date"
                  value={newEvent.scheduledDate}
                  onChange={(e) => setNewEvent({ ...newEvent, scheduledDate: e.target.value })}
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Название</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Название события"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Адрес</label>
                <select
                  value={newEvent.addressId}
                  onChange={(e) => setNewEvent({ ...newEvent, addressId: e.target.value })}
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Без адреса</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.title || addr.address}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Описание</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={2}
                  placeholder="Описание события"
                  className="w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white border border-white/10 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddEvent}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
            >
              Добавить событие
            </button>
          </div>
        )}
      </div>

      {/* Участники заказа */}
      <div className="border-b border-white/10 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <UserGroupIcon className="size-5 text-gray-400" />
          <h2 className="text-base/7 font-semibold text-white">Участники заказа</h2>
        </div>

        <div>
          {participants.length > 0 && (
            <div className="space-y-3 mb-4">
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
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
                      <Icon className={`size-3.5 ${config.textColor}`} />
                      <span className={`text-xs font-medium ${config.textColor}`}>
                        {config.label}
                      </span>
                      <span className={`text-xs ${config.textColor} opacity-60`}>
                        {users.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {users.map((p) => {
                        const user = p.user || {}
                        const avatarUrl = user.image || null
                        const userName = user.name || 'Пользователь'
                        const initial = userName[0]?.toUpperCase() || 'П'

                        return (
                          <div
                            key={p.id}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={userName}
                                className="size-5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="size-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <span className="text-[10px] font-medium text-indigo-400">
                                  {initial}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-white">
                              {userName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveParticipant(p.id)}
                              className="hover:text-red-400 transition-colors ml-0.5"
                            >
                              <XMarkIcon className="size-3.5 text-gray-400 hover:text-red-400 transition-colors" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="flex-1 min-w-[150px]">
              <select
                value={newParticipant.userId}
                onChange={(e) => setNewParticipant({ ...newParticipant, userId: e.target.value })}
                className="w-full rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
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
                className="w-full rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
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

      {/* Описание */}
      <div className="border-b border-white/10 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="size-5 text-gray-400" />
          <h2 className="text-base/7 font-semibold text-white">Описание</h2>
        </div>

        <div>
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

      {/* Изображения */}
      <div className="border-b border-white/10 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <PhotoIcon className="size-5 text-gray-400" />
          <h2 className="text-base/7 font-semibold text-white">Изображения</h2>
        </div>

        <div>
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