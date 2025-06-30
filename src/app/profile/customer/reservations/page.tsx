import { getUserById, getReservationsByUserId } from '@/lib/github'
import CustomerReservationsClient from './CustomerReservationsClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function CustomerReservationsPage() {
  const cookieStore = cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  const user = await getUserById(userId)
  if (!user || user.role !== 'customer') {
    redirect('/login')
  }

  const reservations = await getReservationsByUserId(userId)

  return <CustomerReservationsClient user={user} reservations={reservations} />
} 