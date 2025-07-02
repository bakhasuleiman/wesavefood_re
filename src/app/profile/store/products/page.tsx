import { requireRole } from '@/lib/auth'
import { getAll } from '@/lib/github-db'
import Products from '../Products'

export default async function StoreProductsPage() {
  const user = await requireRole('store')
  const stores = await getAll('stores')
  const store = stores.find((s: any) => s.userId === user.id)
  
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
  
  return <Products user={user} store={store} />
} 