import { z } from 'zod';

/**
 * Валидация query параметров для GET /workouts.
 */
export const getWorkoutsSchema = z.object({
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Валидация тела запроса для POST /workouts/start.
 * ИСПРАВЛЕНО: убран .uuid() — seed использует строковые ID вида
 * 'foundation-beginner-001'. Ограничиваем длину и допустимые символы.
 */
export const startSessionSchema = z
  .object({
    workoutId: z
      .string()
      .min(1, 'workoutId обязателен')
      .max(100, 'workoutId слишком длинный')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Недопустимые символы в workoutId'),
  })
  .strict();

/**
 * Валидация params для PUT /workouts/:sessionId/finish.
 * ИСПРАВЛЕНО: sessionId тоже может быть строковым (mock-сессии).
 */
export const finishSessionSchema = z.object({
  sessionId: z
    .string()
    .min(1, 'sessionId обязателен')
    .max(100, 'sessionId слишком длинный')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Недопустимые символы в sessionId'),
});

export type GetWorkoutsQuery = z.infer<typeof getWorkoutsSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;