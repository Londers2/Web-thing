// app/api/clients/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Client } from '@/lib/db/index.js'

// GET - получить клиента
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const client = await Client.findByPk(id)
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('GET Client Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - обновить клиента
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    
    const client = await Client.findByPk(id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    await client.update(body)
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('PUT Client Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - удалить клиента
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const client = await Client.findByPk(id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    await client.destroy()
    
    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('DELETE Client Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}