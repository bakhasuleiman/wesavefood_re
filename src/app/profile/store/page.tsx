import { requireRole } from '@/lib/auth'
import { getAll } from '@/lib/github-db'
import Profile from './Profile'

export default async function StoreProfilePage() {
  const user = await requireRole('store')
  const stores = await getAll('stores')
  const store = stores.find((s: any) => s.userId === user.id)
  
  if (!store) {
    // Если у пользователя нет магазина, перенаправляем на регистрацию магазина
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Магазин не найден</h1>
        <p className="mb-4">Для доступа к профилю магазина необходимо зарегистрировать магазин.</p>
        <a href="/register/store" className="btn-primary">
          Зарегистрировать магазин
        </a>
      </div>
    )
  }
  
  return <Profile user={user} />
} 