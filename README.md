# Kettlebell Pro App

## Описание
Масштабируемое веб-приложение для тренировок с гирей, разработанное с использованием лучших практик Fullstack-разработки.

## Стек технологий
- **Frontend:** React, Vite, Axios
- **Backend:** Node.js, Express
- **Database:** PostgreSQL, Prisma ORM

## Архитектура
Проект разделен на `backend` и `frontend`. Используется компонентный подход на фронтенде и MVC-паттерн на бэкенде.

## Безопасность
- Валидация данных на бэкенде (Zod).
- Helmet для защиты заголовков HTTP.
- Обязательный "Safety Check" (чеклист безопасности) перед началом тренировки.

## Запуск

### Backend
```bash
cd backend
npm install
# Создайте .env файл с DATABASE_URL
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
