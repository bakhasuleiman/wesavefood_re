'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Script from 'next/script'

export default function RegisterPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'customer' | 'store' | null>(null)

  // Функция для обработки авторизации через Telegram
  const onTelegramAuth = useCallback(async (user: any) => {
    if (!selectedRole) {
      toast.error('Пожалуйста, выберите тип аккаунта')
      return
    }

    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, role: selectedRole }),
      })
      if (res.ok) {
        toast.success('Вы успешно вошли через Telegram!')
        router.push(selectedRole === 'store' ? '/profile/store' : '/profile/customer')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Ошибка авторизации через Telegram')
      }
    } catch (e) {
      toast.error('Ошибка соединения с сервером')
    }
  }, [selectedRole, router])

  // Глобально объявляем функцию для Telegram Widget только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onTelegramAuth = onTelegramAuth
    }
  }, [onTelegramAuth])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Вход/регистрация через Telegram</h1>

      {!selectedRole ? (
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => setSelectedRole('customer')}
            className="block p-6 bg-white rounded-lg shadow-soft hover:shadow-md transition-shadow text-left"
          >
            <h2 className="text-xl font-semibold mb-4">Для покупателей</h2>
            <p className="text-text-secondary mb-4">
              Войдите как покупатель, чтобы:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2">
              <li>Находить товары со скидкой</li>
              <li>Бронировать товары</li>
              <li>Получать уведомления</li>
              <li>Отслеживать историю покупок</li>
            </ul>
          </button>

          <button
            onClick={() => setSelectedRole('store')}
            className="block p-6 bg-white rounded-lg shadow-soft hover:shadow-md transition-shadow text-left"
          >
            <h2 className="text-xl font-semibold mb-4">Для магазинов</h2>
            <p className="text-text-secondary mb-4">
              Войдите как магазин, чтобы:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2">
              <li>Размещать товары со скидкой</li>
              <li>Управлять бронированиями</li>
              <li>Получать аналитику</li>
              <li>Привлекать новых клиентов</li>
            </ul>
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">
            Войдите как {selectedRole === 'customer' ? 'покупатель' : 'магазин'}
          </h2>
          <div className="flex justify-center mb-4">
            <div id="telegram-login-widget" />
          </div>
          <button
            onClick={() => setSelectedRole(null)}
            className="text-text-secondary hover:text-primary transition-colors"
          >
            ← Выбрать другой тип аккаунта
          </button>
          <Script
            id="telegram-login-widget-script"
            strategy="afterInteractive"
            src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login="wesavefood_login_bot"
            data-size="large"
            data-onauth="onTelegramAuth(user)"
            data-request-access="write"
          />
        </div>
      )}
    </main>
  )
} 