// app/api/orders/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, Client, Image } from '@/lib/db/index.js'
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
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Client, attributes: ['id', 'name', 'phone', 'address'] },
        { 
          model: Image,
          as: 'images',
          required: false,
          attributes: ['id', 'url', 'filename', 'sortOrder']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })
    
    return NextResponse.json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
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
      status: body.status || 'new',
      priority: body.priority || 'medium',
      date: body.date || null,
      totalAmount: body.totalAmount || null,
      clientId: body.clientId || null,
      userId: session.user.id,
    }
    
    const order = await Order.create(orderData)
    
    const orderWithRelations = await Order.findByPk(order.id, {
      include: [
        { model: Client },
        { 
          model: Image,
          as: 'images',
          required: false
        }
      ],
    })
    
    return NextResponse.json(orderWithRelations, { status: 201 })
  } catch (error) {
    console.error('POST Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}