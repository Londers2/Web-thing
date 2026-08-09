// lib/constants/eventTypes.js
export const EVENT_TYPES = {
  measurement: {
    value: 'measurement',
    label: 'Замер',
    icon: '📏',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Выезд для выполнения замеров'
  },
  assembly: {
    value: 'assembly',
    label: 'Сборка',
    icon: '🔧',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    description: 'Сборка мебели или конструкций'
  },
  delivery: {
    value: 'delivery',
    label: 'Доставка',
    icon: '🚚',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    description: 'Доставка материалов или готовой продукции'
  },
  reclamation: {
    value: 'reclamation',
    label: 'Рекламация',
    icon: '🔄',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    description: 'Исправление косяков и недочётов'
  }
}

export const EVENT_STATUSES = {
  pending: {
    value: 'pending',
    label: 'Ожидает',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  },
  in_progress: {
    value: 'in_progress',
    label: 'В работе',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  completed: {
    value: 'completed',
    label: 'Выполнен',
    color: 'bg-green-500/10 text-green-400 border-green-500/20'
  },
  cancelled: {
    value: 'cancelled',
    label: 'Отменён',
    color: 'bg-red-500/10 text-red-400 border-red-500/20'
  }
}

export const EVENT_ROLES = {
  manager: { label: 'Менеджер', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  measurer: { label: 'Замерщик', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  assembler: { label: 'Сборщик', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  driver: { label: 'Водитель', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  technician: { label: 'Техник', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
}