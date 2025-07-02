import { requireRole } from '@/lib/auth'
import { getAll } from '@/lib/github-db'
import Stats from '../Stats'

export default async function StoreStatsPage() {
  const user = await requireRole('store')
  const store = await getAll('stores').then(stores => stores.find(s => s.userId === user.id))
  
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
  
  const allReservations = await getAll('reservations')
  const reservations = allReservations.filter(r => r.storeId === store.id)
  
  return <Stats user={user} store={store} reservations={reservations} />
} 