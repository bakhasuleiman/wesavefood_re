import { requireAuth } from '@/lib/auth'
import CustomerProfile from './customer/Profile'
import StoreProfile from './store/Profile'

export default async function ProfilePage() {
  const user = await requireAuth()

  if (user.role === 'store') {
    return <StoreProfile user={user} />
  }
  return <CustomerProfile user={user} />
} 