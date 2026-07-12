import 'dotenv/config'; // 👈 ЭТА СТРОКА — загружает .env до всех импортов

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './src/middleware/errorHandler';
import { rateLimiter } from './src/middleware/rateLimiter';
import authRoutes from './src/modules/auth/auth.routes';
import favoriteRoutes from './src/modules/favorites/favorite.routes';
import workoutRoutes from './src/modules/workouts/workout.routes';
import { env } from './src/shared/utils/env';

const app = express();

// ========== Security & Middleware ==========
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// ========== Global Rate Limiter ==========
app.use(rateLimiter(200, 60_000)); // 200 запросов в минуту

// ========== Routes ==========
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/favorites', favoriteRoutes);

// ========== Health Check ==========
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'HardcoreTraining API is running',
    timestamp: new Date().toISOString(),
  });
});

// ========== 404 Handler ==========
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ========== Error Handling ==========
app.use(errorHandler);

// ========== Start Server ==========
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
});

export default app;