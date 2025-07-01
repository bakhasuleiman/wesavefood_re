import { requireRole } from '@/lib/auth'
import { getStoreByUserId, getProductsByStoreId } from '@/lib/github'
import StoreProductsClient from './StoreProductsClient'

export default async function StoreProductsPage() {
  const user = await requireRole('store')
  const store = await getStoreByUserId(user.id)
  
  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Магазин не найден</h1>
        <p className="mb-4">Для управления товарами необходимо зарегистрировать магазин.</p>
        <a href="/register/store" className="btn-primary">
          Зарегистрировать магазин
        </a>
      </div>
    )
  }
  
  const products = await getProductsByStoreId(store.id)
  
  return <StoreProductsClient user={user} store={store} products={products} />
} 