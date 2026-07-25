// app/api/orders/calendar/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, OrderParticipant, User, Client } from '@/lib/db/index.js'
import { Op } from 'sequelize'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user?.id
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    // Получаем заказы, где пользователь является участником
    const participants = await OrderParticipant.findAll({
      where: { userId },
      attributes: ['orderId']
    })
    
    const orderIds = participants.map(p => p.orderId)
    
    if (orderIds.length === 0) {
      return NextResponse.json([])
    }
    
    // Получаем заказы с датами, суммой и участниками
    const orders = await Order.findAll({
      where: {
        id: { [Op.in]: orderIds },
        [Op.or]: [
          { date: { [Op.ne]: null } },
          { assemblyDate: { [Op.ne]: null } },
          { deliveryDate: { [Op.ne]: null } }
        ]
      },
      attributes: ['id', 'title', 'date', 'assemblyDate', 'deliveryDate', 'totalAmount'],
      include: [
        {
          model: OrderParticipant,
          include: [{ 
            model: User, 
            attributes: ['id', 'name', 'email', 'image']
          }]
        },
        {
          model: Client,
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['date', 'ASC']]
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('❌ Calendar API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}