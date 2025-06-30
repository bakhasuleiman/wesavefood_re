import { getUserById, getStoreByUserId, getProductsByStoreId } from '@/lib/github'
import StoreProductsClient from './StoreProductsClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function StoreProductsPage() {
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

  const products = await getProductsByStoreId(store.id)

  return <StoreProductsClient user={user} store={store} products={products} />
} 