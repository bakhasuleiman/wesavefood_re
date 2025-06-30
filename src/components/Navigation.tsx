'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

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

          <div className="flex space-x-4">
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
            <Link
              href="/register"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/register')
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 