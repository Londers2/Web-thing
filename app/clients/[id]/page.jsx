// app/clients/[id]/page.jsx
import Sidebar from '@/components/sidebar'
import { Client, Order } from '@/lib/db/index.js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  PencilIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/16/solid'

// Компонент для форматирования телефона
function FormattedPhone({ phone }) {
  if (!phone) return null
  
  // Форматируем телефон
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
      className="text-white font-medium hover:text-indigo-400 transition-colors flex items-center gap-2"
    >
      <PhoneIcon className="size-4 text-gray-400" />
      {formatted}
    </a>
  )
}

// Компонент статуса заказа
function OrderStatusBadge({ status }) {
  const statusConfig = {
    new: { label: 'Новый', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    in_progress: { label: 'В работе', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    completed: { label: 'Выполнен', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'Отменён', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }
  
  const config = statusConfig[status] || statusConfig.new
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  )
}

export default async function ClientPage({ params }) {
  const { id } = await params
  
  const client = await Client.findByPk(id, {
    include: [
      {
        model: Order,
        as: 'orders',
        limit: 10,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'status', 'totalAmount', 'createdAt', 'date']
      }
    ]
  })
  
  if (!client) {
    notFound()
  }
  
  const clientData = client.get({ plain: true })
  
  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto">
        {/* Хлебные крошки */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <Link href="/clients" className="hover:text-indigo-400 transition-colors">
            Клиенты
          </Link>
          <ChevronRightIcon className="size-4" />
          <span className="text-white">{clientData.name}</span>
        </nav>
        
        {/* Заголовок */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <UserIcon className="size-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {clientData.name}
              </h1>
              <div className="mt-1">
                <FormattedPhone phone={clientData.phone} />
              </div>
            </div>
          </div>
          
          <Link
            href={`/clients/${clientData.id}/edit`}
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
            {clientData.address && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">📍 Адрес</p>
                <p className="text-white font-medium mt-1">{clientData.address}</p>
              </div>
            )}
            
            {clientData.phone && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">📞 Телефон</p>
                <FormattedPhone phone={clientData.phone} />
              </div>
            )}
            
            {clientData.createdAt && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">В системе с</p>
                <p className="text-white font-medium mt-1 flex items-center gap-2">
                  <ClockIcon className="size-4 text-gray-400" />
                  {new Date(clientData.createdAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
            
            {clientData.orders && clientData.orders.length > 0 && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">Всего заказов</p>
                <p className="text-2xl font-semibold text-white mt-1 flex items-center gap-2">
                  <ShoppingBagIcon className="size-5 text-gray-400" />
                  {clientData.orders.length}
                </p>
              </div>
            )}
            
            {clientData.orders && clientData.orders.length > 0 && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">Общая сумма заказов</p>
                <p className="text-2xl font-semibold text-white mt-1 flex items-center gap-2">
                  <CurrencyDollarIcon className="size-5 text-gray-400" />
                  {clientData.orders
                    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
                    .toLocaleString()} ₽
                </p>
              </div>
            )}
            
            {clientData.updatedAt && clientData.updatedAt !== clientData.createdAt && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">Обновлён</p>
                <p className="text-white font-medium mt-1 flex items-center gap-2">
                  <ArrowPathIcon className="size-4 text-gray-400" />
                  {new Date(clientData.updatedAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
          
          {/* Заметки */}
          {clientData.notes && (
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="size-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Заметки</p>
                  <p className="text-white mt-1 whitespace-pre-wrap">{clientData.notes}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Заказы клиента */}
          {clientData.orders && clientData.orders.length > 0 && (
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="size-5 text-gray-400" />
                  <p className="text-sm font-medium text-white">Последние заказы</p>
                  <span className="text-xs text-gray-500">({clientData.orders.length})</span>
                </div>
                <Link 
                  href={`/order?clientId=${clientData.id}`}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Все заказы →
                </Link>
              </div>
              
              <div className="space-y-2">
                {clientData.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order/${order.id}`}
                    className="block group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white group-hover:text-indigo-400 transition-colors">
                          {order.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                          <OrderStatusBadge status={order.status} />
                          {order.date && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="size-3" />
                              {new Date(order.date).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                          {order.totalAmount && (
                            <span className="flex items-center gap-1">
                              <CurrencyDollarIcon className="size-3" />
                              {Number(order.totalAmount).toLocaleString()} ₽
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRightIcon className="size-4 text-gray-500 group-hover:text-white transition-colors" />
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