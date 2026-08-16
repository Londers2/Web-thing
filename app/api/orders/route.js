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
      ]
    }
    
    const totalCount = await Order.count({ where })
    
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
          attributes: ['id', 'city', 'street', 'house', 'entrance', 'floor', 'apartment', 'intercom', 'isDefault']
        },
        {
          model: Event,
          attributes: ['id', 'type', 'status', 'scheduledDate', 'description', 'addressId']
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

    console.log('📦 Полученные данные:')
    console.log('  - addresses:', JSON.stringify(body.addresses, null, 2))

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
        console.log(`  📌 Адрес ${i + 1}:`, addr)

        // Проверяем обязательные поля
        if (!addr.street || !addr.house) {
          console.error(`  ❌ Адрес ${i + 1} пропущен: отсутствует улица (${addr.street}) или дом (${addr.house})`)
          continue
        }

        try {
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
        } catch (error) {
          console.error(`  ❌ Ошибка создания адреса ${i + 1}:`, error)
        }
      }
      console.log(`✅ Создано ${createdAddresses.length} адресов`)
    }

    // 3. Создаём события
    if (body.events && body.events.length > 0) {
      console.log(`📅 Добавление ${body.events.length} событий...`)

      for (let i = 0; i < body.events.length; i++) {
        const event = body.events[i]
        let addressId = null

        if (event.addressId) {
          const index = parseInt(event.addressId)
          if (!isNaN(index) && index >= 0 && index < createdAddresses.length) {
            addressId = createdAddresses[index].id
          }
        }

        await Event.create({
          type: event.type,
          status: event.status || 'pending',
          scheduledDate: event.scheduledDate || null,
          description: event.description || null,
          addressId: addressId,
          orderId: order.id,
        })
        console.log(`  ✅ Событие ${i + 1} создано`)
      }
    }

    // 4. Добавляем участников
    if (body.participants && body.participants.length > 0) {
      console.log(`👥 Добавление ${body.participants.length} участников...`)
      const participants = body.participants.map(p => ({
        orderId: order.id,
        userId: p.userId,
        role: p.role,
      }))
      await OrderParticipant.bulkCreate(participants)
    }

    // 5. Загружаем заказ
    const orderWithRelations = await Order.findByPk(order.id, {
      include: [
        { model: Client },
        { model: Address },
        { model: Event, include: [{ model: Address }] },
        {
          model: OrderParticipant,
          include: [{ model: User, attributes: ['id', 'name', 'email', 'image'] }]
        }
      ],
    })

    return NextResponse.json(orderWithRelations, { status: 201 })
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