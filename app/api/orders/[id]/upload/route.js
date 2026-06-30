// app/api/orders/[id]/upload/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Order } from '@/lib/db/index.js'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(request, { params }) {
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
    
    const formData = await request.formData()
    const files = formData.getAll('files')
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'orders', id)
    await mkdir(uploadDir, { recursive: true })
    
    const uploadedImages = []
    
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const ext = path.extname(file.name)
      const filename = `${randomUUID()}${ext}`
      const filepath = path.join(uploadDir, filename)
      
      await writeFile(filepath, buffer)
      
      const imageUrl = `/uploads/orders/${id}/${filename}`
      uploadedImages.push(imageUrl)
    }
    
    // Обновляем заказ с новыми изображениями
    const currentImages = order.images || []
    const allImages = [...currentImages, ...uploadedImages]
    await order.update({ images: allImages })
    
    return NextResponse.json({ 
      success: true, 
      images: uploadedImages,
      allImages 
    })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - удалить изображение
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }
    
    const order = await Order.findByPk(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Удаляем из массива изображений
    const updatedImages = order.images.filter(img => img !== imageUrl)
    await order.update({ images: updatedImages })
    
    // Удаляем файл (опционально)
    const filePath = path.join(process.cwd(), 'public', imageUrl)
    try {
      await unlink(filePath)
    } catch (error) {
      console.error('File deletion error:', error)
    }
    
    return NextResponse.json({ success: true, images: updatedImages })
  } catch (error) {
    console.error('Delete Image Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}