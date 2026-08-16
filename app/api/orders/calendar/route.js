// app/api/orders/calendar/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, OrderParticipant, Event, User } from '@/lib/db/index.js'
import { Op } from 'sequelize'

export async function GET(request) {
  try {
    console.log('🔍 Calendar API - Начало запроса')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error('❌ Calendar API - Нет сессии')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user?.id
    console.log('🔍 Calendar API - User ID:', userId)
    
    if (!userId) {
      console.error('❌ Calendar API - User ID не найден')
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    // Проверяем, есть ли у пользователя заказы
    const participants = await OrderParticipant.findAll({
      where: { userId },
      attributes: ['orderId']
    })
    
    console.log('📋 Calendar API - Найдено участников:', participants.length)
    
    const orderIds = participants.map(p => p.orderId)
    
    if (orderIds.length === 0) {
      console.log('📋 Calendar API - Нет заказов для пользователя')
      return NextResponse.json([])
    }
    
    console.log('📋 Calendar API - ID заказов:', orderIds)
    
    // Получаем заказы с событиями
    const orders = await Order.findAll({
      where: {
        id: { [Op.in]: orderIds }
      },
      attributes: ['id', 'title', 'totalAmount'],
      include: [
        {
          model: Event,
          required: false,
          attributes: ['id', 'type', 'status', 'scheduledDate', 'description']
        },
        {
          model: OrderParticipant,
          include: [{ 
            model: User, 
            attributes: ['id', 'name', 'email', 'image']
          }]
        }
      ]
    })
    
    console.log('📦 Calendar API - Найдено заказов:', orders.length)
    
    // Проверяем каждый заказ на наличие событий
    orders.forEach(order => {
      console.log(`📦 Order ${order.id}: ${order.title}, events: ${order.events?.length || 0}`)
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('❌ Calendar API Error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}