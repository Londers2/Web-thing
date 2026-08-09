// app/api/orders/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, Client, Image, OrderParticipant, User, Address, Event, EventParticipant } from '@/lib/db/index.js'
import { Op } from 'sequelize'

// GET - список заказов
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
      ]
    }
    
    const totalCount = await Order.count({ where })
    
    const rows = await Order.findAll({
      where,
      include: [
        { model: Client, attributes: ['id', 'name', 'phone', 'address'] },
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
          attributes: ['id', 'title', 'address', 'city', 'entrance', 'floor', 'apartment', 'isDefault']
        },
        {
          model: Event,
          attributes: ['id', 'type', 'status', 'scheduledDate', 'title', 'description'],
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
    console.error('GET Orders Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - создание заказа
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    console.log('📦 Создание заказа, полученные данные:', {
      title: body.title,
      clientId: body.clientId,
      addressesCount: body.addresses?.length || 0,
      eventsCount: body.events?.length || 0,
      participantsCount: body.participants?.length || 0,
    })
    
    // Создаём заказ
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
    
    // Добавляем адреса
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Добавление ${body.addresses.length} адресов...`)
      const addressesWithOrder = body.addresses.map(addr => ({
        ...addr,
        orderId: order.id,
        clientId: body.clientId || null,
      }))
      const createdAddresses = await Address.bulkCreate(addressesWithOrder)
      console.log(`✅ Создано ${createdAddresses.length} адресов`)
    }
    
    // Добавляем события
    if (body.events && body.events.length > 0) {
      console.log(`📅 Добавление ${body.events.length} событий...`)
      const eventsWithOrder = body.events.map(event => ({
        ...event,
        orderId: order.id,
      }))
      const createdEvents = await Event.bulkCreate(eventsWithOrder)
      console.log(`✅ Создано ${createdEvents.length} событий`)
    }
    
    // Добавляем участников заказа
    if (body.participants && body.participants.length > 0) {
      console.log(`👥 Добавление ${body.participants.length} участников...`)
      const participants = body.participants.map(p => ({
        orderId: order.id,
        userId: p.userId,
        role: p.role,
      }))
      const createdParticipants = await OrderParticipant.bulkCreate(participants)
      console.log(`✅ Создано ${createdParticipants.length} участников`)
    }
    
    // Загружаем заказ с отношениями
    const orderWithRelations = await Order.findByPk(order.id, {
      include: [
        { model: Client },
        { model: Address },
        { model: Event, include: [{ model: Address }] },
        { 
          model: Image,
          as: 'images',
          required: false
        },
        {
          model: OrderParticipant,
          include: [{ model: User, attributes: ['id', 'name', 'email', 'image'] }]
        }
      ],
    })
    
    console.log('✅ Заказ успешно создан со всеми связями')
    return NextResponse.json(orderWithRelations, { status: 201 })
  } catch (error) {
    console.error('❌ POST Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - обновление заказа
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Получаем ID из URL
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    
    console.log('📝 Обновление заказа:', {
      id,
      title: body.title,
      clientId: body.clientId,
      addressesCount: body.addresses?.length || 0,
      eventsCount: body.events?.length || 0,
      participantsCount: body.participants?.length || 0,
    })
    
    // Находим заказ
    const order = await Order.findByPk(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Обновляем заказ
    const orderData = {
      title: body.title,
      description: body.description || null,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      totalAmount: body.totalAmount || null,
      clientId: body.clientId || null,
    }
    
    await order.update(orderData)
    console.log('✅ Заказ обновлён:', order.id)
    
    // Обновляем адреса
    // Удаляем старые адреса
    await Address.destroy({ where: { orderId: order.id } })
    
    // Добавляем новые адреса
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Добавление ${body.addresses.length} адресов...`)
      const addressesWithOrder = body.addresses.map(addr => ({
        ...addr,
        orderId: order.id,
        clientId: body.clientId || null,
      }))
      const createdAddresses = await Address.bulkCreate(addressesWithOrder)
      console.log(`✅ Создано ${createdAddresses.length} адресов`)
    }
    
    // Обновляем события
    // Удаляем старые события
    await Event.destroy({ where: { orderId: order.id } })
    
    // Добавляем новые события
    if (body.events && body.events.length > 0) {
      console.log(`📅 Добавление ${body.events.length} событий...`)
      const eventsWithOrder = body.events.map(event => ({
        ...event,
        orderId: order.id,
      }))
      const createdEvents = await Event.bulkCreate(eventsWithOrder)
      console.log(`✅ Создано ${createdEvents.length} событий`)
    }
    
    // Обновляем участников заказа
    // Удаляем старых участников
    await OrderParticipant.destroy({ where: { orderId: order.id } })
    
    // Добавляем новых участников
    if (body.participants && body.participants.length > 0) {
      console.log(`👥 Добавление ${body.participants.length} участников...`)
      const participants = body.participants.map(p => ({
        orderId: order.id,
        userId: p.userId,
        role: p.role,
      }))
      const createdParticipants = await OrderParticipant.bulkCreate(participants)
      console.log(`✅ Создано ${createdParticipants.length} участников`)
    }
    
    // Загружаем обновлённый заказ с отношениями
    const orderWithRelations = await Order.findByPk(order.id, {
      include: [
        { model: Client },
        { model: Address },
        { model: Event, include: [{ model: Address }] },
        { 
          model: Image,
          as: 'images',
          required: false
        },
        {
          model: OrderParticipant,
          include: [{ model: User, attributes: ['id', 'name', 'email', 'image'] }]
        }
      ],
    })
    
    console.log('✅ Заказ успешно обновлён со всеми связями')
    return NextResponse.json(orderWithRelations)
  } catch (error) {
    console.error('❌ PUT Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - удаление заказа
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Получаем ID из URL
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    
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