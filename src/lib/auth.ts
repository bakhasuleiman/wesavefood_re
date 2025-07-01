import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUsers, getUserById } from './github'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const telegramId = cookieStore.get('telegram_id')?.value
  
  if (!telegramId) {
    return null
  }
  
  try {
    const user = await getUserById(telegramId)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/register')
  }
  return user
}

export async function requireRole(role: 'customer' | 'store') {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect('/register')
  }
  return user
} 