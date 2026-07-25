// middleware.js (или proxy.js)
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Добавляем CORS заголовки для отладки
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}

export default withAuth({
  pages: { signIn: '/api/auth/signin' }
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
}