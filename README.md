🔥 HardcoreTraining
Веб-приложение для тренировок с гирей (kettlebell).
30 готовых программ — от новичка до профи. Таймер, история, избранное, безопасность.
📋 Содержание

О проекте
Стек технологий
Архитектура
Функциональность
Структура проекта
Быстрый старт
Требования
Backend
Frontend
Seed (наполнение БД)
API
Аутентификация
Тренировки
Избранное
Примеры запросов
Безопасность
Тестирование
CI/CD
Лицензия
🎯 О проекте

HardcoreTraining — это полноценное Fullstack SPA для занятий с гирей.
Приложение включает 30 структурированных тренировок трёх уровней сложности:

Уровень	Описание	Кол-во тренировок
🟢 BEGINNER	Освоение базы, первые движения	10
🟡 INTERMEDIATE	Развитие силы и выносливости	10
🔴 ADVANCED	Интенсивные протоколы и рывки	10
Каждая тренировка содержит подробные упражнения с указанием подходов, повторений, времени отдыха и советов по безопасности.

🛠 Стек технологий

Компонент	Технологии
Frontend	React 18, React Router v6, Vite, Axios, CSS Variables
Backend	Node.js, Express 4, TypeScript 5
Database	PostgreSQL 16, Prisma ORM 7 (с @prisma/adapter-pg)
Auth	JWT (access + refresh tokens), bcryptjs
Validation	Zod (фронт + бэк)
Security	Helmet, CORS, Rate Limiter
Testing	Jest + Supertest (бэк), Vitest + Testing Library (фронт)
CI/CD	GitHub Actions
Linting	ESLint 9, Prettier, Husky + lint-staged
🏗 Архитектура

Проект построен по монорепозиторию с двумя рабочими директориями:

HardcoreTraining/
├── backend/          # Express + TypeScript + Prisma
│   ├── prisma/       # Схема БД, миграции, seed
│   └── src/
│       ├── config/       # Prisma client
│       ├── middleware/    # Auth, error handler, rate limiter, validation
│       ├── modules/      # Feature-based модули (auth, workouts, favorites)
│       └── shared/       # Типы, утилиты (env)
├── frontend/         # React + Vite
│   └── src/
│       ├── components/   # UI-компоненты (карточки, модалки, таймер)
│       ├── context/      # AuthContext, ThemeContext
│       ├── pages/        # Страницы (Home, Workout, History, Profile, Auth)
│       └── services/     # API-клиент (axios с интерцепторами)
└── .github/workflows/    # CI pipeline

Backend следует модульной архитектуре (feature-based modules) с разделением на:

*.routes.ts — маршруты
*.controller.ts — обработчики запросов
*.service.ts — бизнес-логика
*.validator.ts — схемы Zod
Frontend использует компонентный подход с контекстами для глобального состояния.

✨ Функциональность

👤 Аутентификация

Регистрация и вход по email + пароль
JWT access token (7 дней) + refresh token (30 дней)
Автоматическое обновление токена через интерцептор axios
Защищённые маршруты (ProtectedRoute)
Роли: USER / ADMIN
🏋️ Тренировки

30 готовых программ с детальным описанием
Фильтрация по уровню (BEGINNER / INTERMEDIATE / ADVANCED)
Фильтр "Избранное"
Модальное окно с детальным просмотром упражнений
Поиск по названию (на фронте)
⏱ Активная тренировка

Пошаговое выполнение упражнений
Таймер на упражнение (60 сек) + отдых (настраивается)
Старт и завершение сессии (сохраняется в БД)
Safety Check перед началом (чеклист безопасности)
❤️ Избранное

Добавление/удаление тренировок в избранное
Фильтр "FAVORITES" на главной
📊 История

Пагинированный список завершённых тренировок
Дата, уровень, название
🎨 Тема

Тёмная и светлая тема
Сохраняется в localStorage
Автоопределение системной темы
📁 Структура проекта

HardcoreTraining/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Модели БД (User, Workout, Exercise, WorkoutSession, Favorite)
│   │   ├── migrations/            # Миграции Prisma
│   │   └── seed.ts                # Наполнение БД 30 тренировками
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts          # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT проверка
│   │   │   ├── errorHandler.ts    # Централизованный обработчик ошибок
│   │   │   ├── rateLimiter.ts     # In-memory rate limiter
│   │   │   └── validate.middleware.ts # Zod валидация
│   │   ├── modules/
│   │   │   ├── auth/              # Регистрация, логин, refresh
│   │   │   ├── workouts/          # CRUD тренировок, сессии, история
│   │   │   └── favorites/         # Избранное
│   │   └── shared/
│   │       ├── types/index.ts     # JwtPayload, ApiResponse и др.
│   │       └── utils/env.ts       # Zod-валидация .env
│   ├── server.ts                  # Точка входа Express
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Навигация + переключатель темы
│   │   │   ├── ProtectedRoute.jsx # Guard для авторизованных
│   │   │   ├── ExerciseCard.jsx   # Карточка упражнения
│   │   │   ├── Timer.jsx          # Таймер с паузой/сбросом
│   │   │   ├── SafetyCheck.jsx    # Чеклист безопасности
│   │   │   ├── SafetyModal/       # Модалка безопасности
│   │   │   ├── WorkoutCard/       # Карточка тренировки
│   │   │   └── WorkoutModal/      # Детальный просмотр тренировки
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Управление аутентификацией
│   │   │   └── ThemeContext.jsx   # Тёмная/светлая тема
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Главная (список тренировок)
│   │   │   ├── WorkoutPage.jsx    # Активная тренировка с таймером
│   │   │   ├── HistoryPage.jsx    # История завершённых
│   │   │   ├── ProfilePage.jsx    # Профиль пользователя
│   │   │   ├── LoginPage.jsx      # Вход
│   │   │   └── RegisterPage.jsx   # Регистрация
│   │   └── services/
│   │       └── api.js             # Axios + интерцепторы (token refresh)
│   ├── index.html
│   └── package.json
│
├── .github/workflows/ci.yml       # CI: тесты бэка + фронта
├── .husky/pre-commit              # Линтинг перед коммитом
├── .nvmrc                         # Node.js 20
├── eslint.config.js
├── .prettierrc
└── package.json                   # Корневой package (workspaces)

🚀 Быстрый старт

Требования

Node.js 20+ (см. .nvmrc)
PostgreSQL 16+
npm 10+
Backend

cd backend

# Установка зависимостей
npm install

# Создайте .env на основе примера
cp .env.example .env
# Отредактируйте .env: DATABASE_URL, JWT_SECRET и др.

# Генерация Prisma Client
npx prisma generate

# Применение миграций
npx prisma migrate dev

# (Опционально) Наполнение БД тренировками
npx ts-node prisma/seed.ts

# Запуск в режиме разработки
npm run dev

Сервер запустится на http://localhost:3001.

Frontend

cd frontend

npm install
npm run dev

Фронтенд запустится на http://localhost:3000.

Seed (наполнение БД)

Скрипт prisma/seed.ts создаёт 30 тренировок (10 BEGINNER + 10 INTERMEDIATE + 10 ADVANCED) с детальными упражнениями.

cd backend
npx ts-node prisma/seed.ts

📡 API

Базовый URL: http://localhost:3001/api

Аутентификация

Метод	Путь	Описание	Auth
POST	/api/auth/register	Регистрация	❌
POST	/api/auth/login	Вход	❌
POST	/api/auth/refresh	Обновление токена	❌
Тренировки

Метод	Путь	Описание	Auth
GET	/api/workouts	Список тренировок	❌
GET	/api/workouts/:id	Детали тренировки	❌
POST	/api/workouts/start	Начать сессию	✅
PUT	/api/workouts/:sessionId/finish	Завершить сессию	✅
GET	/api/workouts/history	История сессий	✅
Параметры GET /api/workouts:

level — BEGINNER, INTERMEDIATE, ADVANCED
page — номер страницы (по умолч. 1)
limit — записей на странице (по умолч. 20)
Избранное

Метод	Путь	Описание	Auth
GET	/api/favorites	Список избранного	✅
POST	/api/favorites/:workoutId	Добавить в избранное	✅
DELETE	/api/favorites/:workoutId	Удалить из избранного	✅
Примеры запросов

Регистрация:

curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Str0ng!Pass","name":"Иван"}'

Ответ:

{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Иван",
      "role": "USER",
      "createdAt": "2026-07-10T19:26:06.000Z"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  },
  "message": "User registered successfully"
}

Получение тренировок:

curl http://localhost:3001/api/workouts?level=BEGINNER&limit=5

Ответ:

{
  "success": true,
  "data": [
    {
      "id": "foundation-beginner-001",
      "title": "Основы маха гирей",
      "description": "Идеальная тренировка для новичков...",
      "level": "BEGINNER",
      "durationMinutes": 20,
      "exercises": [
        {
          "id": "...",
          "name": "Махи гирей двумя руками",
          "sets": 5,
          "reps": 15,
          "restSeconds": 60
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 10,
    "totalPages": 2
  }
}

Начать тренировку (требуется Bearer token):

curl -X POST http://localhost:3001/api/workouts/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"workoutId":"foundation-beginner-001"}'

🔒 Безопасность

Helmet — защита HTTP-заголовков
CORS — ограничение источников (настраивается через CORS_ORIGIN)
Rate Limiter — 200 запросов/мин на IP (in-memory)
Zod — валидация всех входных данных на бэкенде
bcryptjs — хеширование паролей (12 раундов)
JWT — access + refresh токены
Ограничение тела запроса — express.json({ limit: '10kb' })
Safety Check — чеклист безопасности перед каждой тренировкой на фронте
Обработка ошибок — централизованный error handler (AppError, ZodError, PrismaError)
Безопасность SQL — Prisma ORM предотвращает SQL-инъекции
🧪 Тестирование

Backend (Jest + Supertest)

cd backend

# Все тесты
npm test

# С покрытием
npm run test:coverage

# CI режим
npm run test:ci

Frontend (Vitest + Testing Library)

cd frontend

# Все тесты
npm test

# С UI
npm run test:ui

# С покрытием
npm run test:coverage

Корневой уровень

# Тесты всех воркспейсов
npm test

# Линтинг
npm run lint

# Форматирование
npm run format

⚙️ CI/CD

GitHub Actions настроен на два параллельных джоба:

test-backend — поднимает PostgreSQL 16 в контейнере, применяет миграции, запускает тесты
test-frontend — устанавливает зависимости, запускает тесты
Запускается на push в main/develop и на PR в main.

📄 Лицензия

MIT License. Подробнее — в файле LICENSE.

<div align="center">
<p>Сделано с ❤️ и 🏋️ для сообщества гиревого спорта</p>
<p>
<a href="https://github.com/37Evgeny/HardcoreTraining">GitHub</a>
</p>
</div>

