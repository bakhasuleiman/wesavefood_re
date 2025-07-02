import { requireRole } from '@/lib/auth'
import Reservations from '../Reservations'

export default async function CustomerReservationsPage() {
  const user = await requireRole('customer')
  return <Reservations user={user} />
} 