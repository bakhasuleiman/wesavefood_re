import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'FoodSave.uz - Спасаем еду вместе',
  description: 'Платформа для продажи товаров со скидкой перед окончанием срока годности',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Navigation />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
} 