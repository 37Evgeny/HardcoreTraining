/**
 * Rate Limiter Middleware Tests
 *
 * Тестирует middleware ограничения запросов.
 * ВАЖНО: мокаем env, чтобы NODE_ENV !== 'test' и лимитирование работало.
 */
import express from 'express';
import request from 'supertest';

// Мокаем env ПЕРЕД импортом rateLimiter
jest.mock('../../shared/utils/env', () => ({
  env: {
    NODE_ENV: 'development', // <-- Не 'test', чтобы лимитирование работало
    PORT: 3001,
    LOG_LEVEL: 'info',
  },
}));

import { authRateLimiter, rateLimiter } from '../rateLimiter';

// ============================================================
// Вспомогательная функция
// ============================================================
function createTestApp(limiter: express.RequestHandler) {
  const app = express();
  app.use(limiter);
  app.get('/test', (_req, res) => {
    res.json({ success: true });
  });
  return app;
}

// ============================================================
// Tests
// ============================================================
describe('rateLimiter', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('базовый rateLimiter (фабрика)', () => {
    it('должен пропускать запросы в пределах лимита', async () => {
      const app = createTestApp(rateLimiter(5, 60_000)); // 5 запросов за 60 секунд

      const responses = await Promise.all(
        Array.from({ length: 5 }, () => request(app).get('/test'))
      );

      responses.forEach((res) => {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });

    it('должен блокировать запросы сверх лимита', async () => {
      const app = createTestApp(rateLimiter(3, 60_000)); // 3 запроса за 60 секунд

      const responses = await Promise.all(
        Array.from({ length: 5 }, () => request(app).get('/test'))
      );

      const successCount = responses.filter((r) => r.status === 200).length;
      const blockedCount = responses.filter((r) => r.status === 429).length;

      expect(successCount).toBe(3);
      expect(blockedCount).toBe(2);
    });

    it('должен возвращать корректный ответ при блокировке', async () => {
      const app = createTestApp(rateLimiter(1, 60_000));

      await request(app).get('/test');
      const blockedResponse = await request(app).get('/test');

      expect(blockedResponse.status).toBe(429);
      expect(blockedResponse.body.success).toBe(false);
      expect(blockedResponse.body.message).toBe(
        'Слишком много запросов. Пожалуйста, повторите позже.'
      );
    });

    it('должен добавлять стандартные RateLimit-заголовки', async () => {
      const app = createTestApp(rateLimiter(10, 60_000));

      const response = await request(app).get('/test');

      // В express-rate-limit v7+ заголовки называются RateLimit-*
      // Проверяем оба варианта (старый и новый)
      const hasRateLimitHeader =
        response.headers['ratelimit-limit'] !== undefined ||
        response.headers['x-ratelimit-limit'] !== undefined;

      expect(hasRateLimitHeader).toBe(true);
    });
  });

describe('authRateLimiter', () => {
  it('должен иметь лимит 10 запросов', async () => {
    // Создаём приложение, где эндпоинт возвращает 401 (неуспешный статус)
    const app = express();
    app.use(authRateLimiter);
    app.get('/test', (_req, res) => {
      res.status(401).json({ success: false }); // <-- 401, чтобы запрос УЧИТЫВАЛСЯ
    });

    const responses = await Promise.all(
      Array.from({ length: 11 }, () => request(app).get('/test'))
    );

    const successCount = responses.filter((r) => r.status === 401).length;
    const blockedCount = responses.filter((r) => r.status === 429).length;

    expect(successCount).toBe(10);
    expect(blockedCount).toBe(1);
  });

  it('должен возвращать кастомное сообщение об ошибке', async () => {
    const app = express();
    app.use(authRateLimiter);
    app.get('/test', (_req, res) => {
      res.status(401).json({ success: false });
    });

    // Отправляем 10 запросов (все с 401, все учитываются)
    await Promise.all(
      Array.from({ length: 10 }, () => request(app).get('/test'))
    );
    
    // 11-й запрос должен быть заблокирован
    const blockedResponse = await request(app).get('/test');

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body.message).toBe(
      'Слишком много попыток входа. Попробуйте через 15 минут.'
    );
  });
});
});