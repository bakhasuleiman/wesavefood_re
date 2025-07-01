'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import Script from 'next/script'
import { Fragment } from 'react'

interface User {
  id: string
  name: string
  role: 'customer' | 'store'
}

function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-200 ${open ? 'bg-black bg-opacity-40 visible' : 'bg-transparent invisible'}`}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 relative min-w-[340px] max-w-full w-full max-w-sm transition-all duration-300 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tgLoading, setTgLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (modalOpen && modalRef.current) {
      // Очищаем контейнер перед вставкой
      modalRef.current.innerHTML = ''
      // Создаём скрипт Telegram
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.setAttribute('data-telegram-login', 'wesavefood_login_bot')
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-onauth', 'onTelegramAuth(user)')
      script.setAttribute('data-request-access', 'write')
      script.setAttribute('data-userpic', 'false')
      script.async = true
      modalRef.current.appendChild(script)
    }
  }, [modalOpen])

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
                  <>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                      disabled={tgLoading}
                    >
                      Войти через Telegram
                    </button>
                    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                      <div className="flex flex-col items-center min-h-[120px] justify-center">
                        <div ref={modalRef} />
                        {tgLoading && (
                          <div className="flex flex-col items-center mt-4">
                            <svg className="animate-spin h-8 w-8 text-primary mb-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            <span className="text-xs text-gray-500">Вход через Telegram...</span>
                          </div>
                        )}
                      </div>
                    </Modal>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 