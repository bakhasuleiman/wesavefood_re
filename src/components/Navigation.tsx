'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  role: 'customer' | 'store'
}

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
                  <Link
                    href="/register"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isActive('/register')
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-primary'
                    }`}
                  >
                    Войти через Telegram
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 