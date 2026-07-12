import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as favoriteController from './favorite.controller';

const router = Router();

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
 */
router.post('/:workoutId', authenticate, favoriteController.addFavorite);

/**
 * DELETE /api/favorites/:workoutId
 * Удалить тренировку из избранного.
 */
router.delete('/:workoutId', authenticate, favoriteController.removeFavorite);

export default router;