// components/EventTooltip.jsx
'use client'

import { 
  CalendarIcon, 
  WrenchScrewdriverIcon, 
  TruckIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const typeConfig = {
  date: {
    label: 'Выполнение',
    color: '#3b82f6',
    Icon: CalendarIcon,
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400'
  },
  assembly: {
    label: 'Сборка',
    color: '#f59e0b',
    Icon: WrenchScrewdriverIcon,
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400'
  },
  delivery: {
    label: 'Доставка',
    color: '#10b981',
    Icon: TruckIcon,
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400'
  }
}

function EventTooltipContent({ event }) {
  const { 
    title, 
    type = 'date', 
    start, 
    extendedProps = {} 
  } = event
  
  const {
    totalAmount,
    participants = [],
    date,
    assemblyDate,
    deliveryDate
  } = extendedProps

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Не указана'
    return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ru })
  }

  const formattedAmount = totalAmount && Number(totalAmount) > 0
    ? Number(totalAmount).toLocaleString() + ' ₽'
    : 'Не указана'

  // Уникальные участники
  const uniqueParticipants = []
  const seenIds = new Set()
  
  participants.forEach(p => {
    const userId = p.user?.id || p.userId
    if (userId && !seenIds.has(userId)) {
      seenIds.add(userId)
      uniqueParticipants.push(p)
    }
  })

  // Собираем все даты в один массив для единообразного отображения
  const dates = []
  
  if (date) {
    dates.push({
      label: 'Выполнение',
      icon: CalendarIcon,
      date: date,
      color: '#3b82f6'
    })
  }
  
  if (assemblyDate) {
    dates.push({
      label: 'Сборка',
      icon: WrenchScrewdriverIcon,
      date: assemblyDate,
      color: '#f59e0b'
    })
  }
  
  if (deliveryDate) {
    dates.push({
      label: 'Доставка',
      icon: TruckIcon,
      date: deliveryDate,
      color: '#10b981'
    })
  }

  const config = typeConfig[type] || typeConfig.date

  return (
    <div className="p-3 max-w-xs min-w-[240px]">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.color }}
        />
        <span className="font-semibold text-white text-sm">
          {title}
        </span>
      </div>

      {/* Разделитель */}
      <div className="border-t border-white/10 pt-2 space-y-2">
        {/* Все даты единообразно */}
        {dates.map((d, index) => {
          const Icon = d.icon
          return (
            <div key={index} className="flex items-center gap-1.5 text-sm">
              <Icon className="size-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-300">
                <strong className="text-white">{d.label}:</strong>{' '}
                <span>{formatDate(d.date)}</span>
              </span>
            </div>
          )
        })}

        {/* Сумма */}
        <div className="flex items-center gap-1.5 text-sm pt-1 mt-1 border-t border-white/5">
          <CurrencyDollarIcon className="size-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-300">{formattedAmount}</span>
        </div>

        {/* Участники */}
        {uniqueParticipants.length > 0 && (
          <div className="flex items-start gap-1.5 text-sm pt-1 border-t border-white/5">
            <UserGroupIcon className="size-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300 text-xs break-words leading-relaxed">
              {uniqueParticipants.map(p => p.user?.name || 'Пользователь').join(', ')}
            </span>
          </div>
        )}

        {/* Подсказка */}
        <div className="text-center text-xs text-indigo-400/70 mt-1.5 pt-1 border-t border-white/5">
          Кликните для открытия заказа
        </div>
      </div>
    </div>
  )
}

export default EventTooltipContent