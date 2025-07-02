'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateStore } from '@/lib/github'
import type { User, Store } from '@/lib/github'
import ProfileLayout from '@/components/profile/ProfileLayout'
import YandexMap from '@/components/YandexMap'

interface StoreProfileClientProps {
  user: User
  store: Store
}

export default function StoreProfileClient({ user, store }: StoreProfileClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: store.name,
    description: store.description,
    address: store.address,
    phone: store.phone,
    location: store.location,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateStore({
        ...store,
        ...formData,
      })
      
      toast.success('Профиль магазина обновлен!')
      setEditMode(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating store profile:', error)
      toast.error('Ошибка при обновлении профиля магазина')
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          })
          toast.success('Геолокация определена')
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Ошибка при определении геолокации')
        }
      )
    } else {
      toast.error('Геолокация не поддерживается вашим браузером')
    }
  }

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Данные магазина</h2>
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className="text-primary hover:text-primary-dark"
          >
            {editMode ? 'Отменить' : 'Редактировать'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Название магазина
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Описание
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px]"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Адрес
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Местоположение
              </label>
              <div className="mb-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="btn-secondary w-full"
                >
                  Определить мое местоположение
                </button>
              </div>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <YandexMap
                  stores={[
                    {
                      location: [formData.location.lng, formData.location.lat],
                      name: formData.name,
                      address: formData.address,
                    },
                  ]}
                  onStoreSelect={(store) => {
                    // Можно реализовать дополнительную логику при выборе магазина
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="text-sm text-text-secondary">Название магазина</div>
              <div className="font-medium">{store.name}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Описание</div>
              <div className="whitespace-pre-wrap">{store.description}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Адрес</div>
              <div>{store.address}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Телефон</div>
              <div>{store.phone}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary mb-2">Местоположение</div>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <YandexMap
                  stores={[
                    {
                      location: [store.location.lng, store.location.lat],
                      name: store.name,
                      address: store.address,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>
  )
} 