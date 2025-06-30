import { Suspense } from 'react'
import { getProducts, getStores } from '@/lib/github'
import CatalogClient from './CatalogClient'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  const [products, stores] = await Promise.all([getProducts(), getStores()])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Каталог товаров со скидкой</h1>
      
      <Suspense fallback={<div>Загрузка...</div>}>
        <CatalogClient initialProducts={products} stores={stores} />
      </Suspense>
    </main>
  )
} 