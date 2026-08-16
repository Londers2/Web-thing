// app/page.jsx
'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/calendar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Fetching calendar orders...')

      const res = await fetch('/api/orders/calendar')

      console.log('🔍 Response status:', res.status)

      if (!res.ok) {
        let errorMessage = 'Ошибка загрузки заказов'
        try {
          const errorData = await res.json()
          console.error('❌ API Error data:', errorData)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error('❌ Не удалось распарсить ошибку:', e)
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('📦 Raw orders data:', data)
      console.log('📦 Orders count:', data.length)

      // Преобразуем заказы в события для календаря
      const calendarEvents = []

      data.forEach(order => {
        // Получаем участников
        const participants = order.order_participants || []

        // Для каждого события в заказе создаём событие в календаре
        if (order.events && order.events.length > 0) {
          order.events.forEach(event => {
            if (!event.scheduledDate) return

            const typeMap = {
              assembly: 'сборка',
              delivery: 'доставка',
              measurement: 'замер'
            }

            const typeLabel = typeMap[event.type] || event.type
            const eventTitle = `${order.title} (${typeLabel})`

            calendarEvents.push({
              id: `${order.id}-${event.id}`,
              title: eventTitle,
              start: new Date(event.scheduledDate),
              allDay: true,
              extendedProps: {
                orderId: order.id,
                eventId: event.id,
                type: event.type,
                status: event.status,
                totalAmount: order.totalAmount,
                participants: participants,
                description: event.description
              }
            })
          })
        }
      })

      console.log('📅 Generated calendar events:', calendarEvents.length)
      setEvents(calendarEvents)
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      setError(error.message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (info) => {
    const orderId = info.event.extendedProps?.orderId
    if (orderId) {
      router.push(`/order/${orderId}`)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Загрузка календаря...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400">Ошибка: {error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Календарь заказов</h1>
        <p className="text-sm text-gray-400 mt-1">
          Все даты событий по вашим заказам (замеры, сборка, доставка)
        </p>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
        <Calendar
          events={events}
          onEventClick={handleEventClick}
          height="650px"
        />
      </div>
    </div>
  )
}