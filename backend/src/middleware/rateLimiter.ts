import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

/**
 * Простой in-memory rate limiter.
 * В продакшене заменить на express-rate-limit или Redis.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Очистка устаревших записей каждые 60 секунд
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60_000);

/**
 * Rate limiter middleware.
 * @param maxRequests - максимальное количество запросов за окно
 * @param windowMs - окно в миллисекундах
 */
export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60_000) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      // Новое окно
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      next(new AppError('Too many requests. Please try again later.', 429));
      return;
    }

    entry.count++;
    next();
  };
};