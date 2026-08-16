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
          model: Address
        },
        {
          model: Event,
          include: [{ model: Address }]
        }
      ],
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('❌ GET Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - полное обновление заказа с адресами и событиями
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    
    console.log('📝 === ОБНОВЛЕНИЕ ЗАКАЗА ===')
    console.log('📝 Полученные адреса:', JSON.stringify(body.addresses, null, 2))
    
    const order = await Order.findByPk(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // 1. Обновляем заказ
    await order.update({
      title: body.title,
      description: body.description || null,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      totalAmount: body.totalAmount || null,
      clientId: body.clientId || null,
    })
    console.log('✅ Заказ обновлён')
    
    // 2. Удаляем старые адреса
    await Address.destroy({ where: { orderId: id } })
    
    // 3. Создаём новые адреса
    const createdAddresses = []
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Создание ${body.addresses.length} адресов...`)
      
      for (let i = 0; i < body.addresses.length; i++) {
        const addr = body.addresses[i]
        console.log(`  📌 Адрес ${i + 1}:`, addr)
        
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
          orderId: id,
          clientId: body.clientId || null,
        })
        createdAddresses.push(newAddress)
        console.log(`  ✅ Адрес ${i + 1} создан: ${newAddress.id}`)
      }
    }
    
    // 4. Удаляем старые события
    await Event.destroy({ where: { orderId: id } })
    
    // 5. Создаём новые события
    if (body.events && body.events.length > 0) {
      for (const event of body.events) {
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
          orderId: id,
        })
      }
    }
    
    // 6. Обновляем участников
    await OrderParticipant.destroy({ where: { orderId: id } })
    if (body.participants && body.participants.length > 0) {
      const participants = body.participants.map(p => ({
        orderId: id,
        userId: p.userId,
        role: p.role,
      }))
      await OrderParticipant.bulkCreate(participants)
    }
    
    // 7. Загружаем обновлённый заказ
    const updatedOrder = await Order.findByPk(id, {
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
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('❌ PUT Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - удаление заказа со всеми связями
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
    
    console.log(`🗑️ Заказ ${id} удалён со всеми связями`)
    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}