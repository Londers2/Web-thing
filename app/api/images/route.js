// app/api/images/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Image } from '@/lib/db/index.js'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// POST - загрузка изображений
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const files = formData.getAll('files')
    const targetType = formData.get('targetType') || 'order'
    const targetId = formData.get('targetId')
    
    if (!targetId) {
      return NextResponse.json({ error: 'targetId required' }, { status: 400 })
    }
    
    // Создаём папку для изображений
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', targetType, targetId)
    await mkdir(uploadDir, { recursive: true })
    
    const uploadedImages = []
    
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const ext = path.extname(file.name)
      const filename = `${randomUUID()}${ext}`
      const filepath = path.join(uploadDir, filename)
      const url = `/uploads/${targetType}/${targetId}/${filename}`
      
      await writeFile(filepath, buffer)
      
      // Сохраняем в БД
      const image = await Image.create({
        url,
        filename: file.name,
        size: buffer.length,
        mimeType: file.type,
        targetType,
        targetId,
        userId: session.user.id,
      })
      
      uploadedImages.push(image)
    }
    
    return NextResponse.json({ 
      success: true, 
      images: uploadedImages 
    })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - удаление изображения
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }
    
    const image = await Image.findByPk(imageId)
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    // Удаляем файл
    const filePath = path.join(process.cwd(), 'public', image.url)
    try {
      await unlink(filePath)
    } catch (error) {
      console.error('File deletion error:', error)
    }
    
    await image.destroy()
    
    return NextResponse.json({ success: true, message: 'Image deleted' })
  } catch (error) {
    console.error('Delete Image Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}