// backend/src/modules/favorites/favorite.routes.ts
// Маршруты для работы с избранными тренировками.

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as favoriteController from './favorite.controller';

const router = Router();

/**
 * Zod-схема валидации workoutId в параметрах маршрута.
 * Тренировка должна быть UUID v4.
 */
const workoutIdParamSchema = z.object({
  workoutId: z
    .string()
    .uuid('ID тренировки должен быть валидным UUID'),
});

/**
 * Все маршруты избранного требуют аутентификации.
 */

/**
 * GET /api/favorites
 * Получить список избранных тренировок пользователя.
 */
router.get('/', authenticate, favoriteController.getFavorites);

/**
 * POST /api/favorites/:workoutId
 * Добавить тренировку в избранное.
 * Валидирует workoutId как UUID.
 */
router.post(
  '/:workoutId',
  authenticate,
  validate(workoutIdParamSchema, 'params'),
  favoriteController.addFavorite,
);

/**
 * DELETE /api/favorites/:workoutId
 * Удалить тренировку из избранного.
 * Валидирует workoutId как UUID.
 */
router.delete(
  '/:workoutId',
  authenticate,
  validate(workoutIdParamSchema, 'params'),
  favoriteController.removeFavorite,
);

export default router;