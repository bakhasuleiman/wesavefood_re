import { Suspense } from 'react'
import { getProducts, getStores } from '@/lib/github'
import CatalogClient from './CatalogClient'
import YandexMap from '@/components/YandexMap'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  const [products, stores] = await Promise.all([getProducts(), getStores()])
  const yandexStores = stores.map(store => ({
    location: [store.location.lng, store.location.lat] as [number, number],
    name: store.name,
    address: store.address,
  }))

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Каталог товаров со скидкой</h1>
      
      <div className="mb-8">
        <YandexMap stores={yandexStores} />
      </div>
      
      <Suspense fallback={<div>Загрузка...</div>}>
        <CatalogClient initialProducts={products} stores={stores} />
      </Suspense>
    </main>
  )
} 