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
    console.log('📝 ID заказа:', id)
    console.log('📝 Адресов в запросе:', body.addresses?.length || 0)
    console.log('📝 Событий в запросе:', body.events?.length || 0)
    
    const order = await Order.findByPk(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // 1. Обновляем основные поля
    await order.update({
      title: body.title,
      description: body.description || null,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      totalAmount: body.totalAmount || null,
      clientId: body.clientId || null,
    })
    console.log('✅ Заказ обновлён')
    
    // 2. Удаляем старые адреса и события
    await Address.destroy({ where: { orderId: id } })
    await Event.destroy({ where: { orderId: id } })
    await OrderParticipant.destroy({ where: { orderId: id } })
    console.log('🗑️ Старые связи удалены')
    
    // 3. Создаём новые адреса и запоминаем их ID
    const createdAddresses = []
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Создание ${body.addresses.length} адресов...`)
      
      for (let i = 0; i < body.addresses.length; i++) {
        const addr = body.addresses[i]
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
          orderId: id,
          clientId: body.clientId || null,
        })
        createdAddresses.push(newAddress)
        console.log(`  ✅ Адрес ${i + 1} создан: ${newAddress.id}`)
      }
    }
    
    // 4. Создаём события с правильной привязкой к адресам
    if (body.events && body.events.length > 0) {
      console.log(`📅 Создание ${body.events.length} событий...`)
      
      for (let i = 0; i < body.events.length; i++) {
        const event = body.events[i]
        let addressId = null
        
        // Если у события есть addressId
        if (event.addressId) {
          // Проверяем, является ли addressId индексом (числом)
          const index = parseInt(event.addressId)
          if (!isNaN(index) && index >= 0 && index < createdAddresses.length) {
            // Используем созданный адрес по индексу
            addressId = createdAddresses[index].id
            console.log(`  🔗 Событие ${i + 1} привязано к адресу #${index} (${addressId})`)
          } else if (event.addressId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Это реальный UUID, проверяем существует ли он
            const existingAddress = await Address.findByPk(event.addressId)
            if (existingAddress) {
              addressId = event.addressId
              console.log(`  🔗 Событие ${i + 1} привязано к существующему адресу: ${addressId}`)
            } else {
              console.log(`  ⚠️ Событие ${i + 1}: адрес ${event.addressId} не найден, пропускаем привязку`)
            }
          } else {
            // Непонятный формат, оставляем null
            console.log(`  ⚠️ Событие ${i + 1}: непонятный формат addressId (${event.addressId}), пропускаем привязку`)
          }
        }
        
        const newEvent = await Event.create({
          type: event.type,
          status: event.status || 'pending',
          scheduledDate: event.scheduledDate || null,
          title: event.title || null,
          description: event.description || null,
          addressId: addressId,  // <-- Теперь всегда валидный ID или null
          orderId: id,
        })
        console.log(`  ✅ Событие ${i + 1} создано: ${newEvent.id}`)
      }
    }
    
    // 5. Создаём новых участников
    if (body.participants && body.participants.length > 0) {
      console.log(`👥 Добавление ${body.participants.length} участников...`)
      const participants = body.participants.map(p => ({
        orderId: id,
        userId: p.userId,
        role: p.role,
      }))
      await OrderParticipant.bulkCreate(participants)
    }
    
    // 6. Загружаем обновлённый заказ
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
    
    console.log('✅ Заказ успешно обновлён')
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