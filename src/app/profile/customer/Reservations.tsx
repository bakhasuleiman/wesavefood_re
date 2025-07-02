'use client'

import { useState, useEffect } from 'react'
import { getAll, update } from '@/lib/github-db'
import type { User, Reservation, Product, Store } from '@/lib/github'
import ProfileLayout from '@/components/profile/ProfileLayout'
import toast from 'react-hot-toast'

interface ReservationsProps {
  user: User
}

export default function Reservations({ user }: ReservationsProps) {
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<(Reservation & { product: Product, store: Store })[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [allReservations, products, stores] = await Promise.all([
          getAll('reservations'),
          getAll('products'),
          getAll('stores'),
        ])
        const rawReservations = allReservations.filter((r: any) => r.userId === user.id)
        setReservations(
          rawReservations.map((r: any) => ({
            ...r,
            product: products.find((p: any) => p.id === r.productId)!,
            store: stores.find((s: any) => s.id === r.storeId)!,
          }))
        )
      } catch (e) {
        toast.error('Ошибка загрузки бронирований')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  const handleCancel = async (reservation: Reservation) => {
    try {
      await update('reservations', reservation.id, { status: 'cancelled' })
      setReservations(reservations.map(r => r.id === reservation.id ? { ...r, status: 'cancelled' } : r))
      toast.success('Бронирование отменено')
    } catch (e) {
      toast.error('Ошибка при отмене бронирования')
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(price)

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold mb-6">Мои бронирования</h2>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-secondary rounded" />)}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center text-text-secondary py-8">У вас пока нет бронирований</div>
        ) : (
          <div className="space-y-4">
            {reservations.map(reservation => (
              <div key={reservation.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{reservation.product.name}</h3>
                    <p className="text-sm text-text-secondary">{reservation.store.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(reservation.product.discountPrice)}</div>
                    <div className="text-sm text-warning line-through">{formatPrice(reservation.product.originalPrice)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-text-secondary">Забронировано: {new Date(reservation.createdAt).toLocaleDateString('ru-RU')}</div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      reservation.status === 'active' ? 'bg-success/10 text-success' :
                      reservation.status === 'completed' ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'}`}>{
                        reservation.status === 'active' ? 'Активно' :
                        reservation.status === 'completed' ? 'Завершено' : 'Отменено'
                    }</div>
                    {reservation.status === 'active' && (
                      <button onClick={() => handleCancel(reservation)} className="text-warning hover:text-warning-dark">Отменить</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  )
} 