'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getProducts, getStores, updateReservation } from '@/lib/github'
import type { User, Reservation, Product, Store } from '@/lib/github'
import ProfileLayout from '@/components/profile/ProfileLayout'

interface CustomerReservationsClientProps {
  user: User
  reservations: Reservation[]
}

export default function CustomerReservationsClient({ user, reservations: initialReservations }: CustomerReservationsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<(Reservation & { product: Product, store: Store })[]>([])

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const [products, stores] = await Promise.all([
          getProducts(),
          getStores(),
        ])

        const enrichedReservations = initialReservations.map(reservation => ({
          ...reservation,
          product: products.find(p => p.id === reservation.productId)!,
          store: stores.find(s => s.id === reservation.storeId)!,
        }))

        setReservations(enrichedReservations)
      } catch (error) {
        console.error('Error loading reservations:', error)
        toast.error('Ошибка при загрузке бронирований')
      } finally {
        setLoading(false)
      }
    }

    loadReservations()
  }, [initialReservations])

  const handleCancel = async (reservation: Reservation) => {
    try {
      const updatedReservation = { ...reservation, status: 'cancelled' as const }
      await updateReservation(updatedReservation)
      
      setReservations(reservations.map(r => 
        r.id === reservation.id 
          ? { ...r, ...updatedReservation }
          : r
      ))
      
      toast.success('Бронирование отменено')
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast.error('Ошибка при отмене бронирования')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <ProfileLayout user={user}>
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary rounded" />
            ))}
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-semibold mb-6">Мои бронирования</h2>

        {reservations.length === 0 ? (
          <div className="text-center text-text-secondary py-8">
            У вас пока нет бронирований
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{reservation.product.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {reservation.store.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(reservation.product.discountPrice)}
                    </div>
                    <div className="text-sm text-warning line-through">
                      {formatPrice(reservation.product.originalPrice)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-text-secondary">
                    Забронировано: {new Date(reservation.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        reservation.status === 'active'
                          ? 'bg-success/10 text-success'
                          : reservation.status === 'completed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {{
                        active: 'Активно',
                        completed: 'Завершено',
                        cancelled: 'Отменено',
                      }[reservation.status]}
                    </div>
                    {reservation.status === 'active' && (
                      <button
                        onClick={() => handleCancel(reservation)}
                        className="text-warning hover:text-warning-dark"
                      >
                        Отменить
                      </button>
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