// backend/src/shared/utils/logger.ts

import pino from 'pino';
import { env } from './env';

/**
 * Структурированное логирование через pino.
 * В проде — JSON для парсинга в Datadog/Loki/ELK.
 * В dev — pretty print для читаемости.
 */
export const logger = pino({
  level: env.LOG_LEVEL ?? 'info',
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  base: {
    service: 'hardcore-training-api',
    version: env.npm_package_version,
  },
  redact: [
    'req.headers.authorization', // Никогда не логируем токены
    'body.password',
    'body.passwordHash',
  ],
});

// Middleware для логирования запросов
export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
