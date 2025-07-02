'use client'

import { useState } from 'react'
import EditStoreModal from '@/components/profile/EditStoreModal'
import type { User, Store } from '@/lib/github-db'
import ProfileLayout from '@/components/profile/ProfileLayout'
import { getAll } from '@/lib/github-db'

interface StoreProfileProps {
  user: User
}

export default async function StoreProfile({ user }: StoreProfileProps) {
  const stores = await getAll('stores')
  const store = stores.find((s: any) => s.userId === user.id)
  const [editOpen, setEditOpen] = useState(false)

  if (!store) {
    return (
      <ProfileLayout user={user}>
        <div className="bg-white rounded-lg shadow-soft p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Магазин не найден</h2>
          <a href="/register/store" className="btn-primary">Зарегистрировать магазин</a>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Данные магазина</h2>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="text-primary hover:text-primary-dark"
          >
            Редактировать
          </button>
        </div>
        <div className="space-y-4">
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
              {/* Здесь будет карта */}
            </div>
          </div>
        </div>
        {editOpen && <EditStoreModal store={store} onClose={() => setEditOpen(false)} />}
      </div>
    </ProfileLayout>
  )
} 