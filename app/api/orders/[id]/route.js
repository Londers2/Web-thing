// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, Client, Image, OrderParticipant, User } from '@/lib/db/index.js'  // <-- Добавлен User

// GET - получить один заказ
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('GET Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - обновить заказ
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    
    const order = await Order.findByPk(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Обновляем заказ
    await order.update({
      title: body.title,
      description: body.description || null,
      address: body.address || null,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      date: body.date || null,
      deliveryDate: body.deliveryDate || null,
      assemblyDate: body.assemblyDate || null,
      totalAmount: body.totalAmount || null,
      clientId: body.clientId || null,
    })
    
    // Обновляем участников
    if (body.participants) {
      // Удаляем старых участников
      await OrderParticipant.destroy({ where: { orderId: id } })
      
      // Добавляем новых
      if (body.participants.length > 0) {
        const participants = body.participants.map(p => ({
          orderId: id,
          userId: p.userId,
          role: p.role,
        }))
        await OrderParticipant.bulkCreate(participants)
      }
    }
    
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Client },
        { 
          model: Image,
          as: 'images',
          required: false
        },
        {
          model: OrderParticipant,
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        }
      ],
    })
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('PUT Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - удалить заказ
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const order = await Order.findByPk(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Удаляем связанные данные
    await OrderParticipant.destroy({ where: { orderId: id } })
    await Image.destroy({
      where: {
        targetId: id,
        targetType: 'order'
      }
    })
    
    await order.destroy()
    
    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('DELETE Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}