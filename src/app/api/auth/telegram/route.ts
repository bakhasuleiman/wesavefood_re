// @ts-expect-error: Node.js API route, 'crypto' доступен на сервере
import { createHash, createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getUsers, updateUser } from '@/lib/github'

// Не забудьте добавить TELEGRAM_BOT_TOKEN в .env.local
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

function checkTelegramAuth(data: any): boolean {
  // https://core.telegram.org/widgets/login#checking-authorization
  const { hash, role, ...userData } = data
  const dataCheckString = Object.keys(userData)
    .sort()
    .map(key => `${key}=${userData[key]}`)
    .join('\n')
  const secret = createHash('sha256').update(BOT_TOKEN).digest()
  const hmac = createHmac('sha256', secret).update(dataCheckString).digest('hex')
  return hmac === hash
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  if (!checkTelegramAuth(data)) {
    return NextResponse.json({ message: 'Ошибка валидации Telegram' }, { status: 401 })
  }
  // Проверка времени авторизации (например, не старше 2 минут)
  const now = Math.floor(Date.now() / 1000)
  if (now - Number(data.auth_date) > 120) {
    return NextResponse.json({ message: 'Сессия Telegram устарела' }, { status: 401 })
  }
  // Проверка роли
  const role = data.role || 'customer'
  if (!['customer', 'store'].includes(role)) {
    return NextResponse.json({ message: 'Некорректная роль пользователя' }, { status: 400 })
  }
  // Поиск или создание пользователя
  let users = await getUsers()
  let user = users.find(u => u.id === String(data.id))
  if (!user) {
    user = {
      id: String(data.id),
      email: data.username ? `${data.username}@telegram` : `tg${data.id}@telegram`,
      password: '',
      name: data.first_name + (data.last_name ? ' ' + data.last_name : ''),
      phone: '',
      role: role as 'customer' | 'store',
      createdAt: new Date().toISOString(),
    }
    await updateUser(user)
  }
  // Устанавливаем httpOnly cookie с telegram_id
  const response = NextResponse.json({ ok: true })
  response.cookies.set('telegram_id', String(data.id), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  })
  return response
} 