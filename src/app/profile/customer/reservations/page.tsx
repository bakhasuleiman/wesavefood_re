import { requireRole } from '@/lib/auth'
import { getReservationsByUserId } from '@/lib/github'
import CustomerReservationsClient from './CustomerReservationsClient'

export default async function CustomerReservationsPage() {
  const user = await requireRole('customer')
  const reservations = await getReservationsByUserId(user.id)
  
  return <CustomerReservationsClient user={user} reservations={reservations} />
} 