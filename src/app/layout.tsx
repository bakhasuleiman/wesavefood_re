import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import { initializeDataFiles } from '@/lib/github'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'FoodSave.uz - Спасаем еду вместе',
  description: 'Находите продукты со скидкой в местных магазинах и помогайте сократить пищевые отходы.',
}

// Инициализируем файлы данных при запуске приложения
initializeDataFiles().catch(console.error)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Navigation />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
} 