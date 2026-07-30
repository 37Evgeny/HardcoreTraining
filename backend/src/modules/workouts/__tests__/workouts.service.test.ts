/**
 * Workouts Service Tests
 */
import { AppError } from '../../../middleware/errorHandler';
import * as workoutService from '../workout.service';

// Мокаем Prisma Client
jest.mock('../../../config/prisma', () => ({
  prisma: {
    workout: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    workoutSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from '../../../config/prisma';

describe('WorkoutsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // getWorkouts
  // ============================================================
  describe('getWorkouts', () => {
    it('должен возвращать тренировки с пагинацией без фильтра', async () => {
      const mockWorkouts = Array.from({ length: 15 }, (_, i) => ({
        id: `workout-${i}`,
        title: `Workout ${i}`,
        level: 'BEGINNER',
        exercises: [],
        createdAt: new Date(),
      }));

      (prisma.workout.findMany as jest.Mock).mockResolvedValue(
        mockWorkouts.slice(0, 10)
      );
      (prisma.workout.count as jest.Mock).mockResolvedValue(15);

      const result = await workoutService.getWorkouts({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.meta.total).toBe(15);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('должен фильтровать тренировки по уровню', async () => {
      (prisma.workout.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.workout.count as jest.Mock).mockResolvedValue(0);

      const result = await workoutService.getWorkouts({
        level: 'BEGINNER',
        page: 1,
        limit: 20,
      });

      expect(result.meta.total).toBe(0);
      expect(prisma.workout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { level: 'BEGINNER' },
        })
      );
    });

    it('должен обрабатывать пустой результат', async () => {
      (prisma.workout.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.workout.count as jest.Mock).mockResolvedValue(0);

      const result = await workoutService.getWorkouts({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  }); // <-- закрытие describe('getWorkouts')

  // ============================================================
  // startSession
  // ============================================================
  describe('startSession', () => {
    it('должен успешно создавать сессию тренировки', async () => {
      const mockWorkout = { 
        id: 'workout-1', 
        title: 'Test Workout',
        exercises: [],
      };
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        workoutId: 'workout-1',
        completed: false,
        finishedAt: null,
        createdAt: new Date(),
        workout: { ...mockWorkout, exercises: [] },
      };

      (prisma.workout.findUnique as jest.Mock).mockResolvedValue(mockWorkout);
      (prisma.workoutSession.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await workoutService.startSession(
        { workoutId: 'workout-1' },
        'user-1'
      );

      expect(result.id).toBe('session-1');
      expect(result.userId).toBe('user-1');
      expect(result.completed).toBe(false);
    });

    it('должен выбрасывать ошибку, если тренировка не найдена', async () => {
      (prisma.workout.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        workoutService.startSession({ workoutId: 'nonexistent' }, 'user-1')
      ).rejects.toThrow(AppError);
      
      expect(prisma.workoutSession.create).not.toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку, если есть активная сессия', async () => {
      const mockWorkout = { id: 'workout-1', title: 'Test' };
      const activeSession = { id: 'active-1', completed: false };

      (prisma.workout.findUnique as jest.Mock).mockResolvedValue(mockWorkout);
      // ВАЖНО: мокаем findFirst, чтобы он вернул активную сессию
      (prisma.workoutSession.findFirst as jest.Mock).mockResolvedValue(activeSession);

      await expect(
        workoutService.startSession({ workoutId: 'workout-1' }, 'user-1')
      ).rejects.toThrow(AppError);
    });
  }); // <-- закрытие describe('startSession')

  // ============================================================
  // finishSession
  // ============================================================
  describe('finishSession', () => {
    it('должен успешно завершать сессию', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        workoutId: 'workout-1',
        completed: false,
        finishedAt: null,
      };

      const updatedSession = {
        ...mockSession,
        completed: true,
        finishedAt: new Date(),
        workout: { id: 'workout-1', title: 'Test', level: 'BEGINNER' },
      };

      (prisma.workoutSession.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (prisma.workoutSession.update as jest.Mock).mockResolvedValue(updatedSession);

      const result = await workoutService.finishSession('session-1', 'user-1');

      expect(result.completed).toBe(true);
      expect(result.finishedAt).toBeDefined();
      expect(result.finishedAt).toBeInstanceOf(Date);
    });

    it('должен выбрасывать ошибку, если сессия принадлежит другому пользователю', async () => {
      (prisma.workoutSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-1',
        userId: 'user-2',
        completed: false,
      });

      await expect(
        workoutService.finishSession('session-1', 'user-1')
      ).rejects.toThrow(AppError);
    });

    it('должен выбрасывать ошибку, если сессия уже завершена', async () => {
      (prisma.workoutSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        completed: true,
      });

      await expect(
        workoutService.finishSession('session-1', 'user-1')
      ).rejects.toThrow(AppError);
    });

    it('должен выбрасывать ошибку, если сессия не найдена', async () => {
      (prisma.workoutSession.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        workoutService.finishSession('nonexistent', 'user-1')
      ).rejects.toThrow(AppError);
    });
  }); // <-- закрытие describe('finishSession')
}); // <-- закрытие describe('WorkoutsService')