import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('telegram_id', '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 0, // Удаляем cookie
  })
  return response
} 