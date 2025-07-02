'use client'

import { useState, useMemo } from 'react'
import { format, isAfter, isBefore, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Product, Store } from '@/lib/github-db'
import ProductList from '@/components/ProductList'
import { update } from '@/lib/github-db'
import toast from 'react-hot-toast'

interface CatalogClientProps {
  initialProducts: Product[]
  stores: Store[]
}

export default function CatalogClient({ initialProducts, stores }: CatalogClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [filters, setFilters] = useState({
    search: '',
    storeId: '',
    expiryDays: '',
    minDiscount: '',
  })

  // Вычисляем отфильтрованные товары
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Поиск по названию и описанию
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !product.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Фильтр по магазину
      if (filters.storeId && product.storeId !== filters.storeId) {
        return false
      }

      // Фильтр по сроку годности
      if (filters.expiryDays) {
        const days = parseInt(filters.expiryDays)
        const expiryDate = parseISO(product.expiryDate)
        const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        if (!isBefore(new Date(), expiryDate) || !isAfter(targetDate, expiryDate)) {
          return false
        }
      }

      // Фильтр по минимальной скидке
      if (filters.minDiscount) {
        const discount = Math.round(
          ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
        )
        if (discount < parseInt(filters.minDiscount)) {
          return false
        }
      }

      return true
    })
  }, [products, filters])

  // Обработчик бронирования
  const handleReserve = async (product: Product) => {
    try {
      const updatedProduct = { ...product, status: 'reserved' as const }
      await update('products', product.id, updatedProduct)
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p))
      toast.success('Товар успешно забронирован!')
    } catch (error) {
      console.error('Error reserving product:', error)
      toast.error('Ошибка при бронировании товара')
    }
  }

  const handleUpdate = async (product: Product) => {
    try {
      await update('products', product.id, product)
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
      toast.success('Товар обновлен!')
    } catch (e) {
      toast.error('Ошибка при обновлении товара')
    }
  }

  return (
    <div className="space-y-8">
      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Поиск товаров..."
          className="input"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <select
          className="input"
          value={filters.storeId}
          onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
        >
          <option value="">Все магазины</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={filters.expiryDays}
          onChange={(e) => setFilters({ ...filters, expiryDays: e.target.value })}
        >
          <option value="">Любой срок годности</option>
          <option value="1">До 1 дня</option>
          <option value="3">До 3 дней</option>
          <option value="7">До недели</option>
          <option value="14">До 2 недель</option>
        </select>

        <select
          className="input"
          value={filters.minDiscount}
          onChange={(e) => setFilters({ ...filters, minDiscount: e.target.value })}
        >
          <option value="">Любая скидка</option>
          <option value="10">От 10%</option>
          <option value="25">От 25%</option>
          <option value="50">От 50%</option>
          <option value="75">От 75%</option>
        </select>
      </div>

      {/* Результаты поиска */}
      <div className="text-sm text-text-secondary mb-4">
        Найдено товаров: {filteredProducts.length}
      </div>

      {/* Список товаров */}
      <ProductList products={filteredProducts} onReserve={handleReserve} onUpdate={handleUpdate} />
    </div>
  )
} 