// app/page.jsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import Calendar from '@/components/calendar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

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

      const res = await fetch('/api/orders/calendar')
      if (!res.ok) {
        const error = await res.json()
        console.error('❌ API Error:', error)
        throw new Error(error.error || 'Failed to fetch orders')
      }
      
      const data = await res.json()
      
      const calendarEvents = data.map(order => {
        const events = []
        
        // Получаем участников (проверяем оба возможных имени поля)
        const participants = order.order_participants || order.participants || []
        
        // Проверяем сумму
        const totalAmount = order.totalAmount
        
        // Для каждой даты создаём отдельное событие с полной информацией
        if (order.date) {
          events.push({
            id: `${order.id}-date`,
            title: order.title,
            start: new Date(order.date),
            allDay: true,
            extendedProps: {
              orderId: order.id,
              type: 'date',
              totalAmount: totalAmount,
              participants: participants,
              assemblyDate: order.assemblyDate,
              deliveryDate: order.deliveryDate,
              date: order.date
            }
          })
        }
        
        if (order.assemblyDate) {
          events.push({
            id: `${order.id}-assembly`,
            title: order.title,
            start: new Date(order.assemblyDate),
            allDay: true,
            extendedProps: {
              orderId: order.id,
              type: 'assembly',
              totalAmount: totalAmount,
              participants: participants,
              date: order.date,
              deliveryDate: order.deliveryDate,
              assemblyDate: order.assemblyDate
            }
          })
        }
        
        if (order.deliveryDate) {
          events.push({
            id: `${order.id}-delivery`,
            title: order.title,
            start: new Date(order.deliveryDate),
            allDay: true,
            extendedProps: {
              orderId: order.id,
              type: 'delivery',
              totalAmount: totalAmount,
              participants: participants,
              date: order.date,
              assemblyDate: order.assemblyDate,
              deliveryDate: order.deliveryDate
            }
          })
        }
        
        return events
      }).flat()
      
      setEvents(calendarEvents)
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
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
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Загрузка календаря...</p>
          </div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Календарь заказов</h1>
          {/* <p className="text-sm text-gray-400 mt-1">
            Все даты выполнения, сборки и доставки ваших заказов
          </p> */}
        </div>
        
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5">
          <Calendar 
            events={events} 
            onEventClick={handleEventClick}
            height="650px"
          />
        </div>
      </div>
    </Sidebar>
  )
}