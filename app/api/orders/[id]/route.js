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

// PUT - обновить заказ с адресами и событиями
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
    
    // 2. Обновляем адреса (удаляем старые, создаём новые)
    await Address.destroy({ where: { orderId: id } })
    console.log('🗑️ Старые адреса удалены')
    
    if (body.addresses && body.addresses.length > 0) {
      const addressesWithOrder = body.addresses.map(addr => ({
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
      }))
      
      const created = await Address.bulkCreate(addressesWithOrder)
      console.log(`✅ Создано ${created.length} адресов`)
    }
    
    // 3. Обновляем события (удаляем старые, создаём новые)
    await Event.destroy({ where: { orderId: id } })
    console.log('🗑️ Старые события удалены')
    
    if (body.events && body.events.length > 0) {
      const eventsWithOrder = body.events.map(event => ({
        type: event.type,
        status: event.status || 'pending',
        scheduledDate: event.scheduledDate || null,
        title: event.title || null,
        description: event.description || null,
        addressId: event.addressId || null,
        orderId: id,
      }))
      
      const created = await Event.bulkCreate(eventsWithOrder)
      console.log(`✅ Создано ${created.length} событий`)
    }
    
    // 4. Обновляем участников
    await OrderParticipant.destroy({ where: { orderId: id } })
    
    if (body.participants && body.participants.length > 0) {
      const participants = body.participants.map(p => ({
        orderId: id,
        userId: p.userId,
        role: p.role,
      }))
      await OrderParticipant.bulkCreate(participants)
      console.log(`✅ Создано ${participants.length} участников`)
    }
    
    // 5. Загружаем обновлённый заказ
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Client },
        { 
          model: Image,
          as: 'images',
          required: false
        },
        { model: Address },
        { model: Event, include: [{ model: Address }] },
        {
          model: OrderParticipant,
          include: [{ model: User, attributes: ['id', 'name', 'email', 'image'] }]
        }
      ],
    })
    
    console.log(`✅ Заказ ${id} успешно обновлён`)
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
    console.error('❌ DELETE Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}