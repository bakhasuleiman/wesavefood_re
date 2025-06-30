'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateUser, findUserByEmail } from '@/lib/github'
import type { User } from '@/lib/github'

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
        return
      }

      const user: Omit<User, 'password'> & { password: string } = {
        id: crypto.randomUUID(),
        email,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        role: 'customer',
        createdAt: new Date().toISOString(),
      }

      await updateUser(user)
      
      toast.success('Регистрация успешно завершена!')
      router.push('/stores')
    } catch (error) {
      console.error('Error registering customer:', error)
      toast.error('Ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Регистрация покупателя</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="input"
            placeholder="example@mail.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="input"
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Ваше имя
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="input"
            placeholder="Введите ваше имя"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="input"
            placeholder="+998 90 123 45 67"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </main>
  )
} 