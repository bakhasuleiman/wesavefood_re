import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Возвращаем только безопасные данные пользователя
  return NextResponse.json({
    id: user.id,
    name: user.name,
    role: user.role,
  })
} 