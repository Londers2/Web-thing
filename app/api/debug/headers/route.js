// app/api/debug/headers/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  const headers = Object.fromEntries(request.headers.entries())
  
  return NextResponse.json({
    headers,
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'Не определено',
  })
}