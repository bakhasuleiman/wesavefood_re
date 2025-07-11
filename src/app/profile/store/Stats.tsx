'use client'

import { useState, useEffect } from 'react'
import { getAll } from '@/lib/github-db'
import type { User, Store, Product, Reservation } from '@/lib/github-db'
import ProfileLayout from '@/components/profile/ProfileLayout'
import toast from 'react-hot-toast'

interface StatsProps {
  user: User
  store: Store
  reservations: Reservation[]
}

interface Stats {
  totalProducts: number
  activeProducts: number
  totalReservations: number
  activeReservations: number
  completedReservations: number
  cancelledReservations: number
  totalRevenue: number
  averageDiscount: number
}

async function getProductsByStoreId(storeId: string) {
  const products = await getAll('products')
  return products.filter((p: any) => p.storeId === storeId)
}

export default function StatsPage({ user, store, reservations }: StatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalReservations: 0,
    activeReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    totalRevenue: 0,
    averageDiscount: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const products = await getProductsByStoreId(store.id)
        const activeProducts = products.filter(p => p.status === 'available')
        const completedReservations = reservations.filter(r => r.status === 'completed')
        const revenue = completedReservations.reduce((total, reservation) => {
          const product = products.find(p => p.id === reservation.productId)
          return total + (product?.discountPrice || 0)
        }, 0)
        const totalDiscount = products.reduce((total, product) => {
          const discountPercent = ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
          return total + discountPercent
        }, 0)
        setStats({
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          totalReservations: reservations.length,
          activeReservations: reservations.filter(r => r.status === 'active').length,
          completedReservations: completedReservations.length,
          cancelledReservations: reservations.filter(r => r.status === 'cancelled').length,
          totalRevenue: revenue,
          averageDiscount: products.length ? totalDiscount / products.length : 0,
        })
      } catch (e) {
        toast.error('Ошибка загрузки статистики')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [store.id, reservations])

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(price)

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold mb-6">Статистика магазина</h2>
        {loading ? (
          <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-secondary rounded" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="text-sm text-text-secondary mb-1">Всего товаров</div>
                <div className="text-2xl font-semibold">{stats.totalProducts}</div>
                <div className="text-sm text-success">{stats.activeProducts} в наличии</div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="text-sm text-text-secondary mb-1">Бронирования</div>
                <div className="text-2xl font-semibold">{stats.totalReservations}</div>
                <div className="text-sm">
                  <span className="text-success">{stats.activeReservations} активных</span>
                  {' · '}
                  <span className="text-warning">{stats.cancelledReservations} отменённых</span>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="text-sm text-text-secondary mb-1">Общая выручка</div>
                <div className="text-2xl font-semibold">{formatPrice(stats.totalRevenue)}</div>
                <div className="text-sm text-success">{stats.completedReservations} завершённых заказов</div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="text-sm text-text-secondary mb-1">Средняя скидка</div>
                <div className="text-2xl font-semibold">{stats.averageDiscount.toFixed(1)}%</div>
                <div className="text-sm text-text-secondary">от обычной цены</div>
              </div>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Рекомендации</h3>
              <div className="space-y-2 text-text-secondary">
                {stats.activeProducts === 0 && (<p>• Добавьте товары в каталог, чтобы начать продажи</p>)}
                {stats.averageDiscount < 10 && (<p>• Увеличьте размер скидки для привлечения большего числа покупателей</p>)}
                {stats.cancelledReservations > stats.completedReservations && (<p>• Высокий процент отмен бронирований. Проверьте актуальность информации о товарах</p>)}
                {stats.activeProducts > 0 && stats.activeReservations === 0 && (<p>• У вас есть товары в наличии, но нет активных бронирований. Попробуйте увеличить скидки</p>)}
              </div>
            </div>
          </>
        )}
      </div>
    </ProfileLayout>
  )
} 