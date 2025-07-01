'use client'

import React, { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Script from 'next/script'

export default function CustomerRegisterPage() {
  const router = useRouter()

  // Функция для обработки авторизации через Telegram
  const onTelegramAuth = useCallback(async (user: any) => {
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, role: 'customer' }),
      })
      if (res.ok) {
        toast.success('Вы успешно вошли через Telegram!')
        router.push('/profile/customer')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Ошибка авторизации через Telegram')
      }
    } catch (e) {
      toast.error('Ошибка соединения с сервером')
    }
  }, [router])

  // Глобально объявляем функцию для Telegram Widget только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onTelegramAuth = onTelegramAuth
    }
  }, [onTelegramAuth])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Вход/регистрация через Telegram</h1>
      <div className="flex justify-center">
        <div id="telegram-login-widget" />
      </div>
      <Script
        id="telegram-login-widget-script"
        strategy="afterInteractive"
        src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-login="wesavefood_login_bot"
        data-size="large"
        data-onauth="onTelegramAuth(user)"
        data-request-access="write"
      />
    </main>
  )
} 