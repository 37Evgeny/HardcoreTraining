import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as favoriteController from './favorite.controller';

const router = Router();

/**
 * Валидация workoutId в параметрах маршрута.
 * ИСПРАВЛЕНО: убран .uuid() — совместимо со строковыми ID из seed.
 */
const workoutIdParamSchema = z.object({
  workoutId: z
    .string()
    .min(1, 'ID тренировки обязателен')
    .max(100, 'ID тренировки слишком длинный')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Недопустимые символы в ID тренировки'),
});

// Все маршруты избранного требуют аутентификации
router.get('/', authenticate, favoriteController.getFavorites);
router.post('/:workoutId', authenticate, validate(workoutIdParamSchema, 'params'), favoriteController.addFavorite);
router.delete('/:workoutId', authenticate, validate(workoutIdParamSchema, 'params'), favoriteController.removeFavorite);

export default router;