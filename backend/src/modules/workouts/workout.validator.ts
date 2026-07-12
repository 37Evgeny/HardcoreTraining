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
 */
export const startSessionSchema = z
  .object({
    workoutId: z.string().uuid('Invalid workout ID'),
  })
  .strict();

/**
 * Валидация params для PUT /workouts/:sessionId/finish.
 */
export const finishSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export type GetWorkoutsQuery = z.infer<typeof getWorkoutsSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;