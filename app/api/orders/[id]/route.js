// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order, Client, Image, OrderParticipant, User, Address, Event } from '@/lib/db/index.js'
import { Op } from 'sequelize'

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
    console.log('📝 Полученные события:', JSON.stringify(body.events, null, 2))
    
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
    
    // 2. Обновляем адреса (не удаляем!)
    const addressIdMap = {}
    if (body.addresses && body.addresses.length > 0) {
      console.log(`📌 Обновление ${body.addresses.length} адресов...`)
      
      // Получаем существующие адреса заказа
      const existingAddresses = await Address.findAll({ where: { orderId: id } })
      
      for (let i = 0; i < body.addresses.length; i++) {
        const addr = body.addresses[i]
        
        if (!addr.street || !addr.house) {
          console.error(`  ❌ Адрес ${i + 1} пропущен: отсутствует улица или дом`)
          continue
        }
        
        let address
        // Если у адреса есть ID и он существует в БД
        if (addr.id && !addr.id.startsWith('temp-')) {
          // Обновляем существующий адрес
          address = existingAddresses.find(a => a.id === addr.id)
          if (address) {
            await address.update({
              city: addr.city || null,
              street: addr.street,
              house: addr.house,
              entrance: addr.entrance || null,
              floor: addr.floor || null,
              apartment: addr.apartment || null,
              intercom: addr.intercom || null,
              isDefault: addr.isDefault || false,
            })
            console.log(`  ✅ Адрес ${i + 1} обновлён: ${address.id}`)
          } else {
            // Адрес не найден, создаём новый
            address = await Address.create({
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
            console.log(`  ✅ Адрес ${i + 1} создан: ${address.id}`)
          }
        } else {
          // Новый адрес (без ID или с temp-)
          address = await Address.create({
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
          console.log(`  ✅ Адрес ${i + 1} создан: ${address.id}`)
        }
        
        // Сохраняем маппинг: индекс -> реальный ID адреса
        addressIdMap[i] = address.id
      }
    }
    
    // 3. Удаляем адреса, которых нет в запросе
    if (body.addresses) {
      const keptAddressIds = body.addresses
        .filter(addr => addr.id && !addr.id.startsWith('temp-'))
        .map(addr => addr.id)
      
      await Address.destroy({
        where: {
          orderId: id,
          id: { [Op.notIn]: keptAddressIds }
        }
      })
      console.log(`🗑️ Удалены адреса, которых нет в запросе`)
    }
    
    // 4. Удаляем старые события и создаём новые
    await Event.destroy({ where: { orderId: id } })
    
    if (body.events && body.events.length > 0) {
      console.log(`📅 Создание ${body.events.length} событий...`)
      
      for (let i = 0; i < body.events.length; i++) {
        const event = body.events[i]
        let addressId = null
        
        if (event.addressId) {
          // Проверяем, является ли addressId индексом
          const index = parseInt(event.addressId)
          if (!isNaN(index) && index >= 0 && index in addressIdMap) {
            // Используем реальный ID адреса из маппинга
            addressId = addressIdMap[index]
            console.log(`  🔗 Событие ${i + 1} привязано к адресу #${index} (${addressId})`)
          } else if (event.addressId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Это реальный UUID
            const existingAddress = await Address.findByPk(event.addressId)
            if (existingAddress) {
              addressId = event.addressId
              console.log(`  🔗 Событие ${i + 1} привязано к существующему адресу: ${addressId}`)
            }
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
        console.log(`  ✅ Событие ${i + 1} создано`)
      }
    }
    
    // 5. Обновляем участников
    await OrderParticipant.destroy({ where: { orderId: id } })
    if (body.participants && body.participants.length > 0) {
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