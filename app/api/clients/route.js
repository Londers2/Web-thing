// app/api/clients/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Client } from '@/lib/db/index.js'
import { Op } from 'sequelize'

// GET - список клиентов
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where = {}
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ]
    }
    
    const clients = await Client.findAll({
      where,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'phone', 'address']
    })
    
    return NextResponse.json(clients)
  } catch (error) {
    console.error('GET Clients Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - создание клиента
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    const client = await Client.create(body)
    
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST Client Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}