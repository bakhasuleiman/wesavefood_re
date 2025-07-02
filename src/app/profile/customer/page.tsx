import { requireRole } from '@/lib/auth'
import CustomerProfile from './Profile'

export default async function CustomerProfilePage() {
  const user = await requireRole('customer')
  
  return <CustomerProfile user={user} />
} 