'use client'

import { useState } from 'react'
import { update } from '@/lib/github-db'
import type { User } from '@/lib/github-db'
import toast from 'react-hot-toast'

interface EditProfileModalProps {
  user: User
  onClose: () => void
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await update('users', user.id, {
        name: formData.name,
        phone: formData.phone,
      })
      toast.success('Профиль успешно обновлен!')
      onClose()
    } catch (error: any) {
      toast.error('Ошибка при обновлении профиля: ' + (error?.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Редактировать профиль</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Имя</label>
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
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
          </div>
        </form>
      </div>
    </div>
  )
} 