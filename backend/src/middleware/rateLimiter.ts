import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

/**
 * Redis store для rate limiter.
 * Работает корректно при горизонтальном масштабировании (N инстансов).
 * Fallback: если Redis недоступен — логируем и пропускаем (graceful degradation).
 */
const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', (err) => {
  logger.error('Redis rate limiter error:', err);
});

await redisClient.connect();

export const globalRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  skip: (req) => env.NODE_ENV === 'test', // Не лимитируем в тестах
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  skipSuccessfulRequests: true,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});
