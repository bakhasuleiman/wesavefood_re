# FoodSave.uz

Платформа для продажи товаров со скидкой перед окончанием срока годности.

## Технологии

- Next.js 14
- TypeScript
- Tailwind CSS
- GitHub API (Octokit)
- Mapbox GL
- next-intl для мультиязычности

## Требования

- Node.js 18.0.0 или выше
- npm 7.0.0 или выше
- GitHub аккаунт для хранения данных
- Mapbox аккаунт для карт

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/wesavefood.git
cd wesavefood
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` и добавьте необходимые переменные окружения:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
GITHUB_TOKEN=your_github_token
```

4. Запустите проект в режиме разработки:
```bash
npm run dev
```

## Деплой на Render.com

1. Создайте аккаунт на Render.com
2. Подключите ваш GitHub репозиторий
3. Создайте новый Web Service
4. Используйте следующие настройки:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Добавьте переменные окружения:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `GITHUB_TOKEN`

## Структура проекта

```
wesavefood/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React компоненты
│   ├── lib/             # Утилиты и хелперы
│   └── types/           # TypeScript типы
├── public/              # Статические файлы
└── messages/            # Файлы локализации
```

## Лицензия

MIT 