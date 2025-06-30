'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateStore } from '@/lib/github'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const store = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      location: {
        lat: parseFloat(formData.get('lat') as string),
        lng: parseFloat(formData.get('lng') as string),
      },
      description: formData.get('description') as string,
      phone: formData.get('phone') as string,
    }

    try {
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
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Название магазина
          </label>
          <input
            type="text"
            id="name"
            name="name"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium mb-2">
              Широта
            </label>
            <input
              type="number"
              id="lat"
              name="lat"
              step="any"
              required
              className="input"
              placeholder="41.2995"
            />
          </div>
          <div>
            <label htmlFor="lng" className="block text-sm font-medium mb-2">
              Долгота
            </label>
            <input
              type="number"
              id="lng"
              name="lng"
              step="any"
              required
              className="input"
              placeholder="69.2401"
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