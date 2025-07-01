'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateUser } from '@/lib/github'
import type { User } from '@/lib/github'
import ProfileLayout from '@/components/profile/ProfileLayout'

interface CustomerProfileClientProps {
  user: User
}

export default function CustomerProfileClient({ user }: CustomerProfileClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateUser({
        id: user.id,
        email: user.email,
        name: formData.name,
        phone: formData.phone,
        role: user.role,
        createdAt: user.createdAt,
      })
      toast.success('Профиль успешно обновлен!')
      setEditMode(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Ошибка при обновлении профиля: ' + (error?.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Личные данные</h2>
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className="text-primary hover:text-primary-dark"
          >
            {editMode ? 'Отменить' : 'Редактировать'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Имя
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

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {user.photo_url && (
              <div className="flex justify-center mb-4">
                <img src={user.photo_url} alt="Аватарка Telegram" className="w-24 h-24 rounded-full object-cover border" />
              </div>
            )}
            <div>
              <div className="text-sm text-text-secondary">Имя</div>
              <div>{user.name}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Email</div>
              <div>{user.email}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Телефон</div>
              <div>{user.phone}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Роль</div>
              <div>{user.role === 'store' ? 'Магазин' : 'Покупатель'}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Дата регистрации</div>
              <div>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</div>
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>
  )
} 