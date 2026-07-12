import { z } from 'zod';

/**
 * Схема валидации переменных окружения.
 * Гарантирует, что все необходимые env присутствуют и корректны.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Парсит и валидирует process.env.
 * Выбрасывает ошибку при запуске, если env невалидны.
 */
export const env: Env = envSchema.parse(process.env);