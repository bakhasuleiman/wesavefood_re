import { requireRole } from '@/lib/auth'
import CustomerProfileClient from './CustomerProfileClient'

export default async function CustomerProfilePage() {
  const user = await requireRole('customer')
  
  return <CustomerProfileClient user={user} />
} 