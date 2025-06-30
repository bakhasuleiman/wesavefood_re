import { getUserById, getStoreByUserId } from '@/lib/github'
import StoreProfileClient from './StoreProfileClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function StoreProfilePage() {
  const cookieStore = cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  const user = await getUserById(userId)
  if (!user || user.role !== 'store') {
    redirect('/login')
  }

  const store = await getStoreByUserId(userId)
  if (!store) {
    redirect('/login')
  }

  return <StoreProfileClient user={user} store={store} />
} 