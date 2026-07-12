import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as workoutController from './workout.controller';
import {
  finishSessionSchema,
  getWorkoutsSchema,
  startSessionSchema,
} from './workout.validator';

const router = Router();

/**
 * GET /api/workouts
 * Публичный: список тренировок с фильтрацией и пагинацией.
 */
router.get('/', validate(getWorkoutsSchema, 'query'), workoutController.getWorkouts);

/**
 * GET /api/workouts/history
 * Защищенный: история тренировок пользователя.
 * ВАЖНО: размещен ДО /:id, чтобы избежать конфликта маршрутов.
 */
router.get('/history', authenticate, workoutController.getHistory);

/**
 * GET /api/workouts/:id
 * Публичный: детали тренировки.
 */
router.get('/:id', workoutController.getWorkoutById);

/**
 * POST /api/workouts/start
 * Защищенный: начать тренировку.
 */
router.post(
  '/start',
  authenticate,
  validate(startSessionSchema),
  workoutController.startSession
);

/**
 * PUT /api/workouts/:sessionId/finish
 * Защищенный: завершить тренировку.
 */
router.put(
  '/:sessionId/finish',
  authenticate,
  validate(finishSessionSchema, 'params'),
  workoutController.finishSession
);

export default router;