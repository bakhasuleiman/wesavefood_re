'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateStore, updateUser, findUserByEmail } from '@/lib/github'
import type { Store, User } from '@/lib/github'
import dynamic from 'next/dynamic'
import Script from 'next/script'

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
      const email = formData.get('email') as string

      // Проверяем, не существует ли уже пользователь с таким email
      const existingUser = await findUserByEmail(email)
      if (existingUser) {
        toast.error('Пользователь с таким email уже существует')
        setLoading(false)
        return
      }

      const userId = crypto.randomUUID()
      
      // Создаем пользователя
      const user: Omit<User, 'password'> & { password: string } = {
        id: userId,
        email,
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

  // Функция для обработки авторизации через Telegram
  const onTelegramAuth = useCallback(async (user: any) => {
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      if (res.ok) {
        toast.success('Вы успешно вошли через Telegram!')
        router.push('/profile/store')
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