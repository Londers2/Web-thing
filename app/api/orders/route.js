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

// PUT - обновить заказ с адресами и событиями
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    
    console.log('📝 === НАЧАЛО ОБНОВЛЕНИЯ ЗАКАЗА ===')
    console.log('📝 ID заказа:', id)
    console.log('📝 Полученные данные:')
    console.log('  - addresses:', JSON.stringify(body.addresses, null, 2))
    console.log('  - events:', JSON.stringify(body.events, null, 2))
    console.log('  - participants:', JSON.stringify(body.participants, null, 2))
    console.log('  - clientId:', body.clientId)
    
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
    
    // 2. Удаляем старые адреса
    const deletedAddresses = await Address.destroy({ where: { orderId: id } })
    console.log(`🗑️ Удалено старых адресов: ${deletedAddresses}`)
    
    // 3. Создаём новые адреса
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Создание ${body.addresses.length} адресов...`)
      
      const addressesWithOrder = body.addresses.map(addr => {
        console.log('  - Обработка адреса:', addr)
        return {
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
        }
      })
      
      console.log('📌 Данные для создания адресов:', JSON.stringify(addressesWithOrder, null, 2))
      
      const createdAddresses = await Address.bulkCreate(addressesWithOrder)
      console.log(`✅ Создано ${createdAddresses.length} адресов`)
    } else {
      console.log('📌 Нет адресов для создания')
    }
    
    // 4. Удаляем старые события
    const deletedEvents = await Event.destroy({ where: { orderId: id } })
    console.log(`🗑️ Удалено старых событий: ${deletedEvents}`)
    
    // 5. Создаём новые события
    if (body.events && body.events.length > 0) {
      console.log(`📅 Создание ${body.events.length} событий...`)
      
      const eventsWithOrder = body.events.map(event => ({
        type: event.type,
        status: event.status || 'pending',
        scheduledDate: event.scheduledDate || null,
        title: event.title || null,
        description: event.description || null,
        addressId: event.addressId || null,
        orderId: id,
      }))
      
      console.log('📅 Данные для создания событий:', JSON.stringify(eventsWithOrder, null, 2))
      
      const createdEvents = await Event.bulkCreate(eventsWithOrder)
      console.log(`✅ Создано ${createdEvents.length} событий`)
    } else {
      console.log('📅 Нет событий для создания')
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
    
    console.log('📝 === ОБНОВЛЕНИЕ ЗАВЕРШЕНО ===')
    console.log('📝 Итоговые адреса:', updatedOrder.addresses?.length || 0)
    console.log('📝 Итоговые события:', updatedOrder.events?.length || 0)
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('❌ PUT Order Error:', error)
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