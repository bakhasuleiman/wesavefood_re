import Link from 'next/link'
import { getProducts, getStores, getUsers } from '@/lib/github'

export default async function Home() {
  // Получаем данные для статистики
  const [products, stores, users] = await Promise.all([
    getProducts(),
    getStores(),
    getUsers(),
  ])

  // Примерные расчёты (адаптируйте под свою бизнес-логику)
  const savedProducts = products.length // или products.filter(p => p.status === 'sold').length
  const savedMoney = products.reduce((sum, p) => sum + ((p.originalPrice - p.discountPrice) * p.quantity), 0)
  const storesCount = stores.length
  const usersCount = users.length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* О проекте */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">О проекте FoodSave</h1>
          <p className="text-lg text-text-secondary mb-8 max-w-3xl mx-auto">
            Первая в Узбекистане социально-ориентированная цифровая платформа для борьбы с продовольственными отходами и поддержки устойчивого развития
          </p>
        </section>

        {/* Миссия */}
        <section className="flex flex-col items-center mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl w-full flex flex-col md:flex-row items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Наша миссия</h2>
              <p className="mb-4">
                FoodSave — это инновационная платформа, которая помогает людям экономить деньги и одновременно спасает продукты от утилизации. Мы создаем экосистему, соединяющую магазины, стремящиеся сократить списания продуктов, и покупателей, которые хотят сэкономить и заботятся об экологии.
              </p>
              <p>
                Наша цель — превратить борьбу с фуд-вейстом в современный и удобный процесс для каждого жителя Узбекистана, создавая культуру осознанного потребления.
              </p>
            </div>
            <div className="w-40 h-40 bg-gray-100 rounded-full shadow-inner ml-0 md:ml-8 mt-8 md:mt-0" />
          </div>
        </section>

        {/* Что мы предлагаем */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">Что мы предлагаем</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-green-500 text-3xl mb-2">🌐</div>
              <h3 className="text-lg font-semibold mb-2">Интерактивная карта скидок</h3>
              <p className="text-text-secondary">Геолокация и фильтры для быстрого поиска товаров со скидками в ближайших магазинах</p>
            </div>
            <div className="card">
              <div className="text-yellow-500 text-3xl mb-2">🏅</div>
              <h3 className="text-lg font-semibold mb-2">Система эко-рейтинга</h3>
              <p className="text-text-secondary">Стимулируем ответственное поведение магазинов и помогаем покупателям делать осознанный выбор</p>
            </div>
            <div className="card">
              <div className="text-red-400 text-3xl mb-2">👤</div>
              <h3 className="text-lg font-semibold mb-2">Личный кабинет для магазинов</h3>
              <p className="text-text-secondary">Аналитика и удобная загрузка товаров для эффективного управления скидками</p>
            </div>
            <div className="card">
              <div className="text-green-400 text-3xl mb-2">💚</div>
              <h3 className="text-lg font-semibold mb-2">Умные подписки</h3>
              <p className="text-text-secondary">Персонализированные уведомления о выгодных предложениях в любимых магазинах</p>
            </div>
            <div className="card">
              <div className="text-purple-400 text-3xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold mb-2">AI-модуль рекомендаций</h3>
              <p className="text-text-secondary">Искусственный интеллект подскажет, где собрать список покупок дешевле и экологичнее</p>
            </div>
            <div className="card">
              <div className="text-blue-400 text-3xl mb-2">📈</div>
              <h3 className="text-lg font-semibold mb-2">Эко-статистика в реальном времени</h3>
              <p className="text-text-secondary">Отслеживаем сколько товаров спасено, семей сэкономили и магазинов участвует</p>
            </div>
          </div>
        </section>

        {/* Почему мы достойны President Tech Award */}
        <section className="mb-16">
          <div className="bg-green-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-6">Почему мы достойны President Tech Award</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-700 bg-opacity-30 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Социально-ориентированное digital-решение</h3>
                <p>Мы решаем реальную социальную проблему фуд-вейста в Узбекистане, используя современные технологии для создания положительного социального воздействия.</p>
              </div>
              <div className="bg-green-700 bg-opacity-30 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Инновационные технологии</h3>
                <p>Используем AI для персонализированных рекомендаций, создаем Micro-SaaS для магазинов и открываем новый канал в AdTech с персонализированными акциями.</p>
              </div>
            </div>
            <div className="bg-green-700 bg-opacity-30 rounded-xl p-4 font-semibold">
              Это решение меняет культуру потребления и снижает экологический ущерб, создавая устойчивую экосистему для всех участников.
            </div>
          </div>
        </section>

        {/* Наши достижения */}
        <section className="text-center my-16">
          <h2 className="text-2xl font-bold mb-8">Наши достижения</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-3xl font-bold text-green-600">{savedProducts.toLocaleString()}</div>
              <div>Товаров спасено от утилизации</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">₿ {savedMoney.toLocaleString()}</div>
              <div>Сэкономлено покупателями</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{storesCount}</div>
              <div>Магазинов участвует</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{usersCount}</div>
              <div>Довольных покупателей</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Присоединяйтесь к FoodSave!</h3>
            <p className="mb-6 text-text-secondary">
              Вместе мы сделаем Узбекистан примером осознанного потребления и борьбы с фуд-вейстом. Каждая покупка со скидкой — это шаг к более устойчивому будущему.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/stores" className="btn-primary">
                Начать экономить
              </Link>
              <Link href="/register" className="btn-secondary">
                Регистрация магазина
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
} 