'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Script from 'next/script'

interface User {
  id: string
  name: string
  role: 'customer' | 'store'
}

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tgLoading, setTgLoading] = useState(false)

  useEffect(() => {
    // Проверяем авторизацию при загрузке компонента
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        setUser(null)
        toast.success('Вы успешно вышли из системы')
        window.location.href = '/'
      }
    } catch (error) {
      toast.error('Ошибка при выходе')
    }
  }

  // Telegram Login обработчик
  const onTelegramAuth = useCallback(async (tgUser: any) => {
    setTgLoading(true)
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tgUser, role: 'customer' }),
      })
      if (res.ok) {
        const userData = await fetch('/api/auth/me').then(r => r.json())
        setUser(userData)
        toast.success('Вы успешно вошли через Telegram!')
      } else {
        const data = await res.json()
        toast.error(data.message || 'Ошибка авторизации через Telegram')
      }
    } catch (e: any) {
      toast.error('Ошибка соединения с сервером: ' + (e?.message || e))
    } finally {
      setTgLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onTelegramAuth = onTelegramAuth
    }
  }, [onTelegramAuth])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary">
            FoodSave.uz
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/catalog"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/catalog')
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Каталог
            </Link>
            <Link
              href="/stores"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/stores')
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Магазины
            </Link>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-text-secondary">
                      Привет, {user.name}!
                    </span>
                    <Link
                      href={user.role === 'store' ? '/profile/store' : '/profile/customer'}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive('/profile')
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:text-primary'
                      }`}
                    >
                      Профиль
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-lg text-text-secondary hover:text-primary transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div id="telegram-login-widget" />
                    {tgLoading && <span className="text-xs text-gray-400 ml-2">Вход...</span>}
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 