import dynamic from 'next/dynamic'
import { getAll } from '@/lib/github-db'
import ProductList from '@/components/ProductList'
import YandexMap from '@/components/YandexMap'

export default async function StoresPage() {
  const stores = await getAll('stores')
  const products = await getAll('products')

  // Формируем массив магазинов для YandexMap
  const yandexStores = stores.map(store => ({
    location: [store.location.lng, store.location.lat] as [number, number],
    name: store.name,
    address: store.address,
  }))

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Магазины со скидками</h1>
      
      <div className="mb-8">
        <YandexMap stores={yandexStores} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Товары со скидкой</h2>
        <ProductList
          products={products.filter(p => p.status === 'available')}
        />
      </div>
    </main>
  )
} 