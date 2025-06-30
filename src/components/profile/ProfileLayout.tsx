'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@/lib/github'

interface ProfileLayoutProps {
  user: User
  children: ReactNode
}

export default function ProfileLayout({ user, children }: ProfileLayoutProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname?.startsWith(path)

  const tabs = user.role === 'store' 
    ? [
        { href: '/profile/store', label: 'Профиль' },
        { href: '/profile/store/products', label: 'Товары' },
        { href: '/profile/store/stats', label: 'Статистика' },
      ]
    : [
        { href: '/profile/customer', label: 'Профиль' },
        { href: '/profile/customer/reservations', label: 'Бронирования' },
      ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
        <p className="text-text-secondary">{user.email}</p>
      </div>

      <div className="flex border-b mb-8">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
              isActive(tab.href)
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
} 