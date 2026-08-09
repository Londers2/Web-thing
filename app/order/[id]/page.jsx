// app/order/[id]/page.jsx
import { Order, Client, Image, OrderParticipant, User, Address, Event, EventParticipant } from '@/lib/db/index.js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  PencilIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  PhotoIcon,
  ClockIcon,
  ArrowPathIcon,
  PhoneIcon,
  UserGroupIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  CubeIcon,
  ClipboardDocumentCheckIcon,
  HomeIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import { EVENT_TYPES, EVENT_STATUSES } from '@/lib/constants/eventTypes'
import MapButtons from '@/components/MapButtons'

// Компонент для форматирования телефона
function FormattedPhone({ phone }) {
  if (!phone) return null
  
  const formatPhone = (raw) => {
    const cleaned = raw.replace(/\D/g, '')
    const limited = cleaned.slice(0, 11)
    if (limited.length === 0) return ''
    
    let result = '+7'
    if (limited.length > 1) {
      result += ' ('
      const afterCode = limited.slice(1)
      const firstThree = afterCode.slice(0, 3)
      result += firstThree
      if (afterCode.length >= 3) {
        result += ') '
        const nextThree = afterCode.slice(3, 6)
        if (nextThree.length > 0) {
          result += nextThree
        }
        const afterSix = afterCode.slice(6)
        if (afterSix.length > 0) {
          result += '-'
          const firstTwo = afterSix.slice(0, 2)
          result += firstTwo
          if (afterSix.length > 2) {
            result += '-'
            const lastTwo = afterSix.slice(2, 4)
            result += lastTwo
          }
        }
      }
    }
    return result
  }
  
  const formatted = formatPhone(phone)
  if (!formatted) return null
  
  return (
    <a 
      href={`tel:${phone}`}
      className="text-white hover:text-indigo-400 transition-colors flex items-center gap-2"
    >
      <PhoneIcon className="size-4 text-gray-400" />
      {formatted}
    </a>
  )
}

// Компонент статуса заказа
function StatusBadge({ status }) {
  const statusConfig = {
    new: { label: 'Новый', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    in_progress: { label: 'В работе', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    completed: { label: 'Выполнен', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'Отменён', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }
  
  const config = statusConfig[status] || statusConfig.new
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  )
}

// Компонент приоритета
function PriorityBadge({ priority }) {
  const priorityConfig = {
    low: { label: 'Низкий', color: 'text-gray-400' },
    medium: { label: 'Средний', color: 'text-yellow-400' },
    high: { label: 'Высокий', color: 'text-red-400' },
  }
  
  const config = priorityConfig[priority] || priorityConfig.medium
  
  return <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
}

// Компонент статуса события
function EventStatusBadge({ status }) {
  const statusConfig = {
    pending: { label: 'Ожидает', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    in_progress: { label: 'В работе', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    completed: { label: 'Выполнен', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'Отменён', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }
  
  const config = statusConfig[status] || statusConfig.pending
  
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  )
}

// Компонент для отображения событий
function EventsSection({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-gray-400 text-sm">Нет запланированных событий</div>
    )
  }

  // Группируем события по типу
  const groupedEvents = events.reduce((acc, event) => {
    const type = event.type
    if (!acc[type]) acc[type] = []
    acc[type].push(event)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(groupedEvents).map(([type, typeEvents]) => {
        const typeInfo = EVENT_TYPES[type]
        if (!typeInfo) return null
        
        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${typeInfo.color}`}>
                {typeInfo.icon} {typeInfo.label}
              </span>
              <span className="text-xs text-gray-500">({typeEvents.length})</span>
            </div>
            
            {typeEvents.map((event) => (
              <div key={event.id} className="bg-white/5 rounded-lg p-3 ml-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.title && (
                        <span className="text-sm font-medium text-white">{event.title}</span>
                      )}
                      <EventStatusBadge status={event.status} />
                      {event.scheduledDate && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {new Date(event.scheduledDate).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                    )}
                    
                    {event.address && (
                      <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                        <MapPinIcon className="size-3 flex-shrink-0 mt-0.5" />
                        <span>{event.address.address}</span>
                        {event.address.title && (
                          <span className="text-gray-600">({event.address.title})</span>
                        )}
                      </div>
                    )}

                    {/* Дополнительные поля для замера */}
                    {event.type === 'measurement' && event.measurementData && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-400">Данные замера:</span>
                        <pre className="mt-1 bg-black/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.measurementData, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Поля для рекламации */}
                    {event.type === 'reclamation' && (
                      <div className="mt-2 space-y-1 text-xs">
                        {event.issueDescription && (
                          <p className="text-gray-400">
                            <span className="text-gray-500">Проблема:</span> {event.issueDescription}
                          </p>
                        )}
                        {event.resolution && (
                          <p className="text-green-400">
                            <span className="text-gray-500">Решение:</span> {event.resolution}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Результат выполнения */}
                    {event.result && (
                      <p className="mt-1 text-xs text-gray-400">
                        <span className="text-gray-500">Результат:</span> {event.result}
                      </p>
                    )}
                  </div>
                  
                  {event.startDate && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockIconSolid className="size-3" />
                      {new Date(event.startDate).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// Компонент для отображения адресов
function AddressesSection({ addresses }) {
  if (!addresses || addresses.length === 0) {
    return <div className="text-gray-400 text-sm">Нет добавленных адресов</div>
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <div key={addr.id} className="bg-white/5 rounded-lg p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {addr.isDefault && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-400 rounded-full">
                    Основной
                  </span>
                )}
                {addr.title && (
                  <span className="text-sm font-medium text-white">{addr.title}</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{addr.address}</p>
              
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                {addr.city && <span>🏙️ {addr.city}</span>}
                {addr.entrance && <span>🚪 Подъезд: {addr.entrance}</span>}
                {addr.floor && <span>🏢 Этаж: {addr.floor}</span>}
                {addr.apartment && <span>📮 Кв: {addr.apartment}</span>}
                {addr.intercom && <span>📞 Домофон: {addr.intercom}</span>}
              </div>
              
              {addr.comment && (
                <p className="text-xs text-gray-500 mt-1">📝 {addr.comment}</p>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <MapButtons address={addr.address} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Компонент для отображения участников
function ParticipantsSection({ participants }) {
  if (!participants || participants.length === 0) return null
  
  const roleConfig = {
    manager: { 
      label: 'Менеджер', 
      icon: BriefcaseIcon,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    measurer: { 
      label: 'Замерщик', 
      icon: WrenchScrewdriverIcon,
      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    },
    assembler: { 
      label: 'Сборщик', 
      icon: TruckIcon,
      color: 'bg-green-500/10 text-green-400 border-green-500/20'
    }
  }
  
  const grouped = participants.reduce((acc, p) => {
    const role = p.role
    if (!acc[role]) acc[role] = []
    acc[role].push(p)
    return acc
  }, {})
  
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="flex items-center gap-2 mb-4">
        <UserGroupIcon className="size-5 text-gray-400" />
        <p className="text-sm font-medium text-white">Участники заказа</p>
      </div>
      
      <div className="space-y-3">
        {Object.entries(grouped).map(([role, users]) => {
          const config = roleConfig[role]
          if (!config) return null
          const Icon = config.icon
          
          return (
            <div key={role} className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.color}`}>
                <Icon className={`size-3.5 ${config.color.split(' ')[1]}`} />
                <span className={`text-xs font-medium ${config.color.split(' ')[1]}`}>
                  {config.label}
                </span>
                <span className={`text-xs ${config.color.split(' ')[1]} opacity-60`}>
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
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function OrderPage({ params }) {
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
      },
      {
        model: Address
      },
      {
        model: Event,
        include: [{ model: Address }]
      }
    ],
  })
  
  if (!order) {
    notFound()
  }
  
  const orderData = order.get({ plain: true })
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Хлебные крошки */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/order" className="hover:text-indigo-400 transition-colors">
          Заказы
        </Link>
        <ChevronRightIcon className="size-4" />
        <span className="text-white">{orderData.title}</span>
      </nav>
      
      {/* Заголовок */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {orderData.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <StatusBadge status={orderData.status} />
            <PriorityBadge priority={orderData.priority} />
          </div>
        </div>
        
        <Link
          href={`/order/${orderData.id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 transition-colors"
        >
          <PencilIcon className="size-4" />
          Редактировать
        </Link>
      </div>
      
      {/* Основная информация */}
      <div className="space-y-6">
        {/* Информационные карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderData.totalAmount && (
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-gray-400">Сумма</p>
              <p className="text-xl font-semibold text-white mt-1">
                {Number(orderData.totalAmount).toLocaleString()} ₽
              </p>
            </div>
          )}
          
          {orderData.client && (
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-gray-400">Клиент</p>
              <Link 
                href={`/clients/${orderData.client.id}`}
                className="text-white hover:text-indigo-400 transition-colors flex items-center gap-2 mt-1"
              >
                <UserIcon className="size-4 text-gray-400" />
                <span className="font-medium">{orderData.client.name}</span>
              </Link>
              {orderData.client.phone && (
                <div className="mt-1">
                  <FormattedPhone phone={orderData.client.phone} />
                </div>
              )}
            </div>
          )}
          
          {orderData.createdAt && (
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-gray-400">Создан</p>
              <p className="text-white font-medium mt-1 flex items-center gap-2">
                <ClockIcon className="size-4 text-gray-400" />
                {new Date(orderData.createdAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
        
        {/* Адреса */}
        <div className="rounded-xl bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="size-5 text-gray-400" />
            <p className="text-sm font-medium text-white">Адреса</p>
            <span className="text-xs text-gray-500">({orderData.addresses?.length || 0})</span>
          </div>
          <AddressesSection addresses={orderData.addresses || []} />
        </div>
        
        {/* События */}
        <div className="rounded-xl bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentCheckIcon className="size-5 text-gray-400" />
            <p className="text-sm font-medium text-white">События</p>
            <span className="text-xs text-gray-500">({orderData.events?.length || 0})</span>
          </div>
          <EventsSection events={orderData.events || []} />
        </div>
        
        {/* Участники заказа */}
        <ParticipantsSection participants={orderData.order_participants || []} />
        
        {/* Описание */}
        {orderData.description && (
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="size-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Описание</p>
                <p className="text-white mt-1 whitespace-pre-wrap">{orderData.description}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Изображения */}
        {orderData.images && orderData.images.length > 0 && (
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-4">
              <PhotoIcon className="size-5 text-gray-400" />
              <p className="text-sm text-gray-400">Изображения</p>
              <span className="text-xs text-gray-500">({orderData.images.length})</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {orderData.images.map((image) => (
                <a
                  key={image.id}
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group relative"
                >
                  <img
                    src={image.url}
                    alt={image.filename || 'Изображение'}
                    className="w-32 h-32 object-cover rounded-lg border border-white/10 hover:border-indigo-500 transition-all group-hover:shadow-lg group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Мета-информация */}
        <div className="rounded-xl bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="size-5 text-gray-400" />
            <p className="text-sm font-medium text-white">Информация о заказе</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-4" />
              Создан: {new Date(orderData.createdAt).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            {orderData.updatedAt && orderData.updatedAt !== orderData.createdAt && (
              <span className="flex items-center gap-1.5">
                <ArrowPathIcon className="size-4" />
                Обновлён: {new Date(orderData.updatedAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}