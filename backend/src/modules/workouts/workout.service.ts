import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { GetWorkoutsQuery, StartSessionInput } from './workout.validator';

/**
 * Получение списка тренировок с пагинацией и фильтрацией.
 */
export const getWorkouts = async (query: GetWorkoutsQuery) => {
  const { level, page, limit } = query;
  const skip = (page - 1) * limit;

  const where = level ? { level } : {};

  const [workouts, total] = await Promise.all([
    prisma.workout.findMany({
      where,
      include: {
        exercises: {
          select: {
            id: true,
            name: true,
            sets: true,
            reps: true,
            restSeconds: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workout.count({ where }),
  ]);

  return {
    data: workouts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Получение деталей тренировки по ID.
 */
export const getWorkoutById = async (id: string) => {
  const workout = await prisma.workout.findUnique({
    where: { id },
    include: { exercises: true },
  });

  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  return workout;
};

/**
 * Начало новой тренировочной сессии.
 */
export const startSession = async (
  input: StartSessionInput,
  userId: string
) => {
  const { workoutId } = input;

  // Проверка существования тренировки
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
  });

  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  // Создание сессии
  const session = await prisma.workoutSession.create({
    data: {
      workoutId,
      userId,
      completed: false,
    },
    include: {
      workout: {
        include: { exercises: true },
      },
    },
  });

  return session;
};

/**
 * Завершение тренировочной сессии.
 */
export const finishSession = async (sessionId: string, userId: string) => {
  // Поиск сессии
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  // Проверка принадлежности пользователю
  if (session.userId !== userId) {
    throw new AppError('You can only finish your own sessions', 403);
  }

  // Проверка, что сессия еще не завершена
  if (session.completed) {
    throw new AppError('Session already completed', 400);
  }

  // Завершение сессии
  const updatedSession = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      completed: true,
      finishedAt: new Date(),
    },
    include: {
      workout: {
        select: {
          id: true,
          title: true,
          level: true,
        },
      },
    },
  });

  return updatedSession;
};

/**
 * Получение истории сессий пользователя.
 */
export const getSessionHistory = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId },
      include: {
        workout: {
          select: {
            id: true,
            title: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.workoutSession.count({ where: { userId } }),
  ]);

  return {
    data: sessions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};