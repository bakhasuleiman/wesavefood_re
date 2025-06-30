import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-2xl font-bold mb-4">
            Спасаем еду вместе с FoodSave.uz
          </h1>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Находите продукты со скидкой в местных магазинах и помогайте сократить пищевые отходы.
            Экономьте деньги и заботьтесь об экологии вместе с нами.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/stores" className="btn-primary">
              Найти магазины
            </Link>
            <Link href="/register" className="btn-secondary">
              Зарегистрировать магазин
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Для магазинов</h3>
            <p className="text-text-secondary">
              Управляйте скидками, получайте аналитику и работайте с системой бронирований
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Для покупателей</h3>
            <p className="text-text-secondary">
              Ищите скидки, используйте геолокацию и получайте уведомления о новых предложениях
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Для экологии</h3>
            <p className="text-text-secondary">
              Помогайте сократить пищевые отходы и следите за экологической статистикой
            </p>
          </div>
        </section>
      </div>
    </main>
  )
} 