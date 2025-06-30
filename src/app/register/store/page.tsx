'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateStore, updateUser } from '@/lib/github'
import type { Store, User } from '@/lib/github'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-lg shadow-soft bg-secondary animate-pulse" />
  ),
})

export default function StoreRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({
    lat: 41.2995,
    lng: 69.2401,
  })

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const userId = crypto.randomUUID()
      
      // Создаем пользователя
      const user: Omit<User, 'password'> & { password: string } = {
        id: userId,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        role: 'store',
        createdAt: new Date().toISOString(),
      }

      await updateUser(user)

      // Создаем магазин
      const store: Store = {
        id: crypto.randomUUID(),
        userId,
        name: formData.get('storeName') as string,
        address: formData.get('address') as string,
        location,
        description: formData.get('description') as string,
        phone: formData.get('phone') as string,
      }

      await updateStore(store)
      
      toast.success('Магазин успешно зарегистрирован!')
      router.push('/stores')
    } catch (error) {
      console.error('Error registering store:', error)
      toast.error('Ошибка при регистрации магазина')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Регистрация магазина</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="input"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="input"
              placeholder="••••••••"
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Ваше имя
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="input"
            placeholder="Введите ваше имя"
          />
        </div>

        <div>
          <label htmlFor="storeName" className="block text-sm font-medium mb-2">
            Название магазина
          </label>
          <input
            type="text"
            id="storeName"
            name="storeName"
            required
            className="input"
            placeholder="Введите название магазина"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Адрес
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            className="input"
            placeholder="Введите адрес магазина"
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
            <Map
              stores={[
                {
                  id: 'new',
                  userId: '',
                  name: 'Ваш магазин',
                  address: '',
                  location,
                  description: '',
                  phone: '',
                },
              ]}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            required
            className="input min-h-[100px]"
            placeholder="Расскажите о вашем магазине"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="input"
            placeholder="+998 90 123 45 67"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрировать магазин'}
        </button>
      </form>
    </main>
  )
} 