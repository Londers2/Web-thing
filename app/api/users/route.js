// app/api/users/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { User } from '@/lib/db/index.js'

// GET - список всех пользователей
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'image'],
      order: [['name', 'ASC']],
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('GET Users Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}