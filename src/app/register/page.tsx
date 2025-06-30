import Link from 'next/link'

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Регистрация</h1>

      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          href="/register/customer"
          className="block p-6 bg-white rounded-lg shadow-soft hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">Для покупателей</h2>
          <p className="text-text-secondary mb-4">
            Регистрируйтесь как покупатель, чтобы:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Находить товары со скидкой</li>
            <li>Бронировать товары</li>
            <li>Получать уведомления</li>
            <li>Отслеживать историю покупок</li>
          </ul>
        </Link>

        <Link
          href="/register/store"
          className="block p-6 bg-white rounded-lg shadow-soft hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">Для магазинов</h2>
          <p className="text-text-secondary mb-4">
            Регистрируйтесь как магазин, чтобы:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Размещать товары со скидкой</li>
            <li>Управлять бронированиями</li>
            <li>Получать аналитику</li>
            <li>Привлекать новых клиентов</li>
          </ul>
        </Link>
      </div>
    </main>
  )
} 