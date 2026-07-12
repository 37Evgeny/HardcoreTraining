import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

/**
 * Получить все избранные тренировки пользователя.
 */
export const getFavorites = async (userId: string) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      workout: {
        include: {
          exercises: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => f.workout);
};

/**
 * Добавить тренировку в избранное.
 */
export const addFavorite = async (userId: string, workoutId: string) => {
  // Проверяем, существует ли тренировка
  const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!workout) {
    throw new AppError('Тренировка не найдена', 404);
  }

  // Проверяем, не добавлена ли уже в избранное
  const existing = await prisma.favorite.findUnique({
    where: { userId_workoutId: { userId, workoutId } },
  });

  if (existing) {
    throw new AppError('Тренировка уже в избранном', 409);
  }

  return prisma.favorite.create({
    data: { userId, workoutId },
    include: {
      workout: true,
    },
  });
};

/**
 * Удалить тренировку из избранного.
 */
export const removeFavorite = async (userId: string, workoutId: string) => {
  const existing = await prisma.favorite.findUnique({
    where: { userId_workoutId: { userId, workoutId } },
  });

  if (!existing) {
    throw new AppError('Тренировка не найдена в избранном', 404);
  }

  await prisma.favorite.delete({
    where: { userId_workoutId: { userId, workoutId } },
  });
};