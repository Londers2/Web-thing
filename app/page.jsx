// app/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Calendar from '@/components/calendar'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders/calendar')
      if (!res.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await res.json()
      
      // Преобразуем в события календаря
      const calendarEvents = data.map(order => {
        const events = []
        if (order.date) {
          events.push({
            id: order.id,
            title: order.title,
            start: new Date(order.date),
            allDay: true,
            extendedProps: { orderId: order.id, type: 'date' }
          })
        }
        if (order.assemblyDate) {
          events.push({
            id: `${order.id}-assembly`,
            title: order.title,
            start: new Date(order.assemblyDate),
            allDay: true,
            extendedProps: { orderId: order.id, type: 'assembly' }
          })
        }
        if (order.deliveryDate) {
          events.push({
            id: `${order.id}-delivery`,
            title: order.title,
            start: new Date(order.deliveryDate),
            allDay: true,
            extendedProps: { orderId: order.id, type: 'delivery' }
          })
        }
        return events
      }).flat()
      
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching orders:', error)
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
          <p className="mt-4 text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Календарь заказов</h1>
        <p className="text-sm text-gray-400 mt-1">
          Все даты выполнения, сборки и доставки ваших заказов
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