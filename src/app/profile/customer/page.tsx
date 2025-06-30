import { getUserById } from '@/lib/github'
import CustomerProfileClient from './CustomerProfileClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function CustomerProfilePage() {
  const cookieStore = cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  const user = await getUserById(userId)
  if (!user) {
    redirect('/login')
  }

  return <CustomerProfileClient user={user} />
} 