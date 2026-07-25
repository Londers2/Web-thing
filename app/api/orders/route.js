// app/api/orders/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, Client, Image, OrderParticipant, User } from '@/lib/db/index.js'
import { Op, Sequelize } from 'sequelize'

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

    console.log('🔍 Поисковый запрос:', search)
    console.log('🔍 Длина запроса:', search?.length)

    // Строим условия для where
    const where = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    // Если есть поиск, ищем по заказам
    if (search && search.trim()) {
      const searchValue = search.trim()
      where[Op.or] = [
        { title: { [Op.iLike]: `%${searchValue}%` } },
        { description: { [Op.iLike]: `%${searchValue}%` } },
        { address: { [Op.iLike]: `%${searchValue}%` } },
      ]
      console.log('🔍 Условия поиска:', where[Op.or])
    }

    // Получаем все заказы с include
    let rows = await Order.findAll({
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
        }
      ],
      order: [['createdAt', 'DESC']],
    })

    console.log('📦 Найдено заказов до фильтрации по клиентам:', rows.length)

    // Если есть поиск, фильтруем заказы по клиентам и участникам вручную
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase()

      rows = rows.filter(order => {
        // Проверяем заголовок, описание, адрес (уже отфильтровано в where)
        let found = true // Заказы уже отфильтрованы по этим полям

        // Проверяем клиента
        if (order.client) {
          const clientMatch =
            order.client.name?.toLowerCase().includes(searchLower) ||
            order.client.phone?.includes(search.trim())
          if (clientMatch) return true
        }

        // Проверяем участников
        if (order.order_participants && order.order_participants.length > 0) {
          const participantMatch = order.order_participants.some(p =>
            p.user?.name?.toLowerCase().includes(searchLower)
          )
          if (participantMatch) return true
        }

        // Если заказ найден по заголовку/описанию/адресу, он уже в списке
        return found
      })

      console.log('📦 Найдено заказов после фильтрации по клиентам и участникам:', rows.length)
      console.log('📦 Заголовки найденных заказов:', rows.map(o => o.title))
    }

    // Пагинация вручную
    const totalCount = rows.length
    const paginatedRows = rows.slice(offset, offset + limit)
    const totalPages = Math.ceil(totalCount / limit) || 1

    return NextResponse.json({
      data: paginatedRows,
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

    const orderData = {
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
      userId: session.user.id,
    }

    const order = await Order.create(orderData)

    // Добавляем участников
    if (body.participants && body.participants.length > 0) {
      const participants = body.participants.map(p => ({
        orderId: order.id,
        userId: p.userId,
        role: p.role,
      }))
      await OrderParticipant.bulkCreate(participants)
    }

    // Загружаем заказ с отношениями
    const orderWithRelations = await Order.findByPk(order.id, {
      include: [
        { model: Client },
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

    return NextResponse.json(orderWithRelations, { status: 201 })
  } catch (error) {
    console.error('POST Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}