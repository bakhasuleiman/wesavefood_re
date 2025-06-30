import dynamic from 'next/dynamic'
import { getStores, getProducts } from '@/lib/github'
import ProductList from '@/components/ProductList'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg shadow-soft bg-secondary animate-pulse" />
  ),
})

export default async function StoresPage() {
  const stores = await getStores()
  const products = await getProducts()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Магазины со скидками</h1>
      
      <div className="mb-8">
        <Map stores={stores} />
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