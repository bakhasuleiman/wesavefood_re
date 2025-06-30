import { getUserById, getStoreByUserId, getReservations } from '@/lib/github'
import StoreStatsClient from './StoreStatsClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function StoreStatsPage() {
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

  const allReservations = await getReservations()
  const reservations = allReservations.filter(r => r.storeId === store.id)

  return <StoreStatsClient user={user} store={store} reservations={reservations} />
} 