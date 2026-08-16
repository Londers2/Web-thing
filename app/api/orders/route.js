// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, Client, Image, OrderParticipant, User, Address, Event } from '@/lib/db/index.js'

// GET - получить заказ с адресами и событиями
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
          include: [{ model: User, attributes: ['id', 'name', 'email', 'image'] }]
        },
        {
          model: Address  // <-- Добавляем адреса
        },
        {
          model: Event,   // <-- Добавляем события
          include: [{ model: Address }]
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    console.log('📦 Полученные данные:', {
      title: body.title,
      clientId: body.clientId,
      addressesCount: body.addresses?.length || 0,
      eventsCount: body.events?.length || 0,
    })
    
    // 1. Создаём заказ с правильными значениями
    const orderData = {
      title: body.title,
      description: body.description || null,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      totalAmount: body.totalAmount || null,
      clientId: body.clientId || null,  // <-- null вместо пустой строки
      userId: session.user.id,
    }
    
    console.log('📦 Данные для создания заказа:', orderData)
    
    const order = await Order.create(orderData)
    console.log('✅ Заказ создан:', order.id)
    
    // 2. Создаём адреса
    const createdAddresses = []
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Добавление ${body.addresses.length} адресов...`)
      
      for (const addr of body.addresses) {
        const newAddress = await Address.create({
          title: addr.title || null,
          address: addr.address,
          city: addr.city || null,
          entrance: addr.entrance || null,
          floor: addr.floor || null,
          apartment: addr.apartment || null,
          intercom: addr.intercom || null,
          comment: addr.comment || null,
          isDefault: addr.isDefault || false,
          orderId: order.id,
          clientId: body.clientId || null,
        })
        createdAddresses.push(newAddress)
        console.log(`  ✅ Адрес создан: ${newAddress.id}`)
      }
    }
    
    // 3. Создаём события с привязкой к адресам
    if (body.events && body.events.length > 0) {
      console.log(`📅 Добавление ${body.events.length} событий...`)
      
      for (let i = 0; i < body.events.length; i++) {
        const event = body.events[i]
        
        // Определяем addressId
        let addressId = null
        if (event.addressId) {
          // Если addressId — это индекс (число)
          const index = parseInt(event.addressId)
          if (!isNaN(index) && createdAddresses[index]) {
            addressId = createdAddresses[index].id
            console.log(`  🔗 Событие ${i + 1} привязано к адресу #${index}`)
          } else {
            // Если addressId — это реальный UUID
            addressId = event.addressId
          }
        }
        
        const newEvent = await Event.create({
          type: event.type,
          status: event.status || 'pending',
          scheduledDate: event.scheduledDate || null,
          title: event.title || null,
          description: event.description || null,
          addressId: addressId,
          orderId: order.id,
        })
        console.log(`  ✅ Событие ${i + 1} создано: ${newEvent.id}`)
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
    
    // 5. Загружаем заказ со всеми связями
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
    
    console.log('✅ Заказ успешно создан со всеми связями')
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