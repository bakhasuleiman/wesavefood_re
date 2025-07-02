'use client'

import { useState } from 'react'
import { update } from '@/lib/github-db'
import type { Store } from '@/lib/github-db'
import toast from 'react-hot-toast'

interface EditStoreModalProps {
  store: Store
  onClose: () => void
}

export default function EditStoreModal({ store, onClose }: EditStoreModalProps) {
  const [formData, setFormData] = useState({
    name: store.name,
    description: store.description,
    address: store.address,
    phone: store.phone,
    location: store.location,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await update('stores', store.id, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
      })
      toast.success('Данные магазина обновлены!')
      onClose()
    } catch (error: any) {
      toast.error('Ошибка при обновлении магазина: ' + (error?.message || ''))
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
          toast.error('Ошибка при определении геолокации')
        }
      )
    } else {
      toast.error('Геолокация не поддерживается вашим браузером')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Редактировать магазин</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Название магазина</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2">Адрес</label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">Телефон</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Местоположение</label>
            <div className="mb-2">
              <button type="button" onClick={handleGetLocation} className="btn-secondary w-full">Определить моё местоположение</button>
            </div>
            <div className="text-xs text-text-secondary">Текущие координаты: {formData.location.lat}, {formData.location.lng}</div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
          </div>
        </form>
      </div>
    </div>
  )
} 