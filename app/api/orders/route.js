// app/api/orders/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, Client, Image, OrderParticipant, User, Address, Event } from '@/lib/db/index.js'
import { Op } from 'sequelize'

// GET - список заказов с фильтрацией и пагинацией
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit
    
    const where = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ]
    }
    
    // Получаем общее количество
    const totalCount = await Order.count({ where })
    
    // Получаем заказы с пагинацией
    const rows = await Order.findAll({
      where,
      include: [
        { 
          model: Client, 
          attributes: ['id', 'name', 'phone', 'address'] 
        },
        { 
          model: Image,
          as: 'images',
          required: false,
          attributes: ['id', 'url', 'filename', 'sortOrder']
        },
        {
          model: OrderParticipant,
          include: [{ 
            model: User, 
            attributes: ['id', 'name', 'email', 'image']
          }]
        },
        {
          model: Address,
          attributes: ['id', 'title', 'address', 'city', 'entrance', 'floor', 'apartment', 'isDefault', 'comment']
        },
        {
          model: Event,
          attributes: ['id', 'type', 'status', 'scheduledDate', 'title', 'description', 'addressId'],
          include: [
            {
              model: Address,
              attributes: ['id', 'title', 'address']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })
    
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      data: rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      }
    })
  } catch (error) {
    console.error('❌ GET Orders Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - создание заказа с адресами, событиями и участниками
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    console.log('📦 Создание заказа, полученные адреса:', body.addresses)
    
    // 1. Создаём заказ
    const orderData = {
      title: body.title,
      description: body.description || null,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      totalAmount: body.totalAmount || null,
      clientId: body.clientId || null,
      userId: session.user.id,
    }
    
    const order = await Order.create(orderData)
    console.log('✅ Заказ создан:', order.id)
    
    // 2. Создаём адреса
    const createdAddresses = []
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Добавление ${body.addresses.length} адресов...`)
      
      for (let i = 0; i < body.addresses.length; i++) {
        const addr = body.addresses[i]
        console.log(`  Адрес ${i + 1}:`, addr)
        
        // Проверяем обязательные поля
        if (!addr.street || !addr.house) {
          console.error(`  ❌ Адрес ${i + 1} пропущен: отсутствует улица или дом`)
          continue
        }
        
        const newAddress = await Address.create({
          city: addr.city || null,
          street: addr.street,
          house: addr.house,
          entrance: addr.entrance || null,
          floor: addr.floor || null,
          apartment: addr.apartment || null,
          intercom: addr.intercom || null,
          isDefault: addr.isDefault || false,
          orderId: order.id,
          clientId: body.clientId || null,
        })
        createdAddresses.push(newAddress)
        console.log(`  ✅ Адрес ${i + 1} создан: ${newAddress.id}`)
      }
    }
    
    // ... остальной код
  } catch (error) {
    console.error('❌ POST Order Error:', error)
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
    await Address.destroy({ where: { orderId: id } })
    await Event.destroy({ where: { orderId: id } })
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