
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    // Главную страницу оставляем открытой
    if (path === '/') {
      return NextResponse.next()
    }
    
    // Все остальные страницы требуют авторизации
    if (!token) {
      const signInUrl = new URL('/api/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(signInUrl)
    }
    
    return NextResponse.next()
  },
  {
    pages: { signIn: '/api/auth/signin' },
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ]
}