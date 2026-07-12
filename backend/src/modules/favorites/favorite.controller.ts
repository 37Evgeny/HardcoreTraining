import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import * as favoriteService from './favorite.service';

/**
 * GET /api/favorites
 * Возвращает список избранных тренировок текущего пользователя.
 */
export const getFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const favorites = await favoriteService.getFavorites(userId);

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/favorites/:workoutId
 * Добавляет тренировку в избранное.
 */
export const addFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { workoutId } = req.params;

    if (!workoutId) {
      throw new AppError('ID тренировки обязателен', 400);
    }

    const favorite = await favoriteService.addFavorite(userId, workoutId);

    res.status(201).json({
      success: true,
      data: favorite,
      message: 'Тренировка добавлена в избранное',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/favorites/:workoutId
 * Удаляет тренировку из избранного.
 */
export const removeFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { workoutId } = req.params;

    if (!workoutId) {
      throw new AppError('ID тренировки обязателен', 400);
    }

    await favoriteService.removeFavorite(userId, workoutId);

    res.status(200).json({
      success: true,
      message: 'Тренировка удалена из избранного',
    });
  } catch (error) {
    next(error);
  }
};