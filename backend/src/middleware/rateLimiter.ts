/**
 * Rate Limiter Middleware
 * 
 * Использует in-memory хранилище (express-rate-limit по умолчанию).
 * В production с несколькими репликами рекомендуется RedisStore.
 * 
 * @module rateLimiter
 */
import rateLimit from 'express-rate-limit';
import { env } from '../shared/utils/env';
import { logger } from '../shared/utils/logger';

/**
 * Конфигурируемый rate limiter.
 * 
 * @param maxRequests - максимальное количество запросов за windowMs
 * @param windowMs - временное окно в миллисекундах
 * @returns middleware express-rate-limit
 */
export const rateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true, // Возвращаем RateLimit-* заголовки
    legacyHeaders: false,  // Не используем X-RateLimit-* (устаревшие)
    
    // Пропускаем лимитирование в тестовом окружении
    skip: () => env.NODE_ENV === 'test',
    
    // Кастомный обработчик при превышении лимита
    handler: (_req, res) => {
      logger.warn(`Rate limit exceeded for ${_req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Слишком много запросов. Пожалуйста, повторите позже.',
      });
    },
  });
};

/**
 * Строгий rate limiter для эндпоинтов аутентификации.
 * 10 запросов за 15 минут, успешные запросы не учитываются.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10,                   // 10 попыток
  skipSuccessfulRequests: true, // Не считаем успешные логины
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => {
    logger.warn(`Auth rate limit exceeded for ${_req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
    });
  },
});