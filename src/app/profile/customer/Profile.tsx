'use client'

import { useState } from 'react'
import EditProfileModal from '@/components/profile/EditProfileModal'
import type { User } from '@/lib/github-db'
import ProfileLayout from '@/components/profile/ProfileLayout'

interface CustomerProfileProps {
  user: User
}

export default function CustomerProfile({ user }: CustomerProfileProps) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Личные данные</h2>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="text-primary hover:text-primary-dark"
          >
            Редактировать
          </button>
        </div>
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
        {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)} />}
      </div>
    </ProfileLayout>
  )
} 