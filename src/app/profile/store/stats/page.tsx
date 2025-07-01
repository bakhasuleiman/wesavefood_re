import { requireRole } from '@/lib/auth'
import { getStoreByUserId, getReservations } from '@/lib/github'
import StoreStatsClient from './StoreStatsClient'

export default async function StoreStatsPage() {
  const user = await requireRole('store')
  const store = await getStoreByUserId(user.id)
  
  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Магазин не найден</h1>
        <p className="mb-4">Для доступа к статистике необходимо зарегистрировать магазин.</p>
        <a href="/register/store" className="btn-primary">
          Зарегистрировать магазин
        </a>
      </div>
    )
  }
  
  const allReservations = await getReservations()
  const reservations = allReservations.filter(r => r.storeId === store.id)
  
  return <StoreStatsClient user={user} store={store} reservations={reservations} />
} 