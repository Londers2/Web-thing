// app/order/[id]/page.jsx
import Sidebar from '@/components/sidebar'
import { Order, Client, Image, OrderParticipant, User } from '@/lib/db/index.js'
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
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
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

// Компонент статуса
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

// Компонент для отображения участников
function ParticipantsSection({ participants }) {
  if (!participants || participants.length === 0) return null

  const roleConfig = {
    manager: {
      label: 'Менеджер',
      icon: BriefcaseIcon,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    measurer: {
      label: 'Замерщик',
      icon: WrenchScrewdriverIcon,
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20'
    },
    assembler: {
      label: 'Сборщик',
      icon: TruckIcon,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20'
    }
  }

  // Группируем участников по ролям
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
                  </div>
                ))}
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
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
      }
    ],
  })

  if (!order) {
    notFound()
  }

  const orderData = order.get({ plain: true })

  return (
    <Sidebar>
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
              {orderData.date && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <CalendarIcon className="size-4" />
                  {new Date(orderData.date).toLocaleDateString('ru-RU')}
                </span>
              )}
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

            {orderData.date && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">Дата выполнения</p>
                <p className="text-white font-medium mt-1 flex items-center gap-2">
                  <CalendarIcon className="size-4 text-gray-400" />
                  {new Date(orderData.date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}

            {orderData.deliveryDate && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">🚚 Дата доставки</p>
                <p className="text-white font-medium mt-1 flex items-center gap-2">
                  <CalendarDaysIcon className="size-4 text-gray-400" />
                  {new Date(orderData.deliveryDate).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}

            {orderData.assemblyDate && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">🔧 Дата сборки</p>
                <p className="text-white font-medium mt-1 flex items-center gap-2">
                  <WrenchScrewdriverIcon className="size-4 text-gray-400" />
                  {new Date(orderData.assemblyDate).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
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

            {orderData.updatedAt && orderData.updatedAt !== orderData.createdAt && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-gray-400">Обновлён</p>
                <p className="text-white font-medium mt-1 flex items-center gap-2">
                  <ArrowPathIcon className="size-4 text-gray-400" />
                  {new Date(orderData.updatedAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Участники заказа */}
          <ParticipantsSection participants={orderData.order_participants || []} />

          {/* Адрес с кнопками карт */}
          {orderData.address && (
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-400">📍 Адрес выполнения</p>
                  <p className="text-white font-medium mt-1">{orderData.address}</p>
                </div>
                <MapButtons address={orderData.address} />
              </div>
            </div>
          )}

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
        </div>
      </div>
    </Sidebar>
  )
}