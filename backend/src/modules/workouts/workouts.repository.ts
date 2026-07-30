// backend/src/modules/workouts/workouts.repository.ts

import { Level, Prisma, Workout, WorkoutSession } from '@prisma/client';
import { prisma } from '../../config/prisma';

export interface WorkoutsFilter {
  level?: Level;
  page: number;
  limit: number;
}

export interface IWorkoutsRepository {
  findAll(filter: WorkoutsFilter): Promise<{ workouts: Workout[]; total: number }>;
  findById(id: string): Promise<Workout | null>;
  createSession(userId: string, workoutId: string): Promise<WorkoutSession>;
  finishSession(sessionId: string, userId: string): Promise<WorkoutSession>;
  findSessionHistory(userId: string, page: number, limit: number): Promise<{
    sessions: WorkoutSession[];
    total: number;
  }>;
}

/**
 * Concrete implementation — знает о Prisma.
 * Service знает только об интерфейсе IWorkoutsRepository.
 * В тестах подставляем MockWorkoutsRepository.
 */
export class PrismaWorkoutsRepository implements IWorkoutsRepository {
  async findAll({ level, page, limit }: WorkoutsFilter) {
    const where: Prisma.WorkoutWhereInput = level ? { level } : {};
    const skip = (page - 1) * limit;

    const [workouts, total] = await prisma.$transaction([
      prisma.workout.findMany({
        where,
        include: { exercises: { orderBy: { order: 'asc' } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.workout.count({ where }),
    ]);

    return { workouts, total };
  }

  async findById(id: string) {
    return prisma.workout.findUnique({
      where: { id },
      include: { exercises: { orderBy: { order: 'asc' } } },
    });
  }

  async createSession(userId: string, workoutId: string) {
    // Проверяем нет ли незавершённой сессии — один пользователь = одна активная
    const activeSession = await prisma.workoutSession.findFirst({
      where: { userId, completedAt: null },
    });

    if (activeSession) {
      throw new ConflictError('You already have an active workout session');
    }

    return prisma.workoutSession.create({
      data: { userId, workoutId, startedAt: new Date() },
      include: { workout: { include: { exercises: true } } },
    });
  }

  async finishSession(sessionId: string, userId: string) {
    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) throw new NotFoundError('Session');
    if (session.completedAt) throw new ConflictError('Session already completed');

    return prisma.workoutSession.update({
      where: { id: sessionId },
      data: { completedAt: new Date() },
      include: { workout: true },
    });
  }

  async findSessionHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await prisma.$transaction([
      prisma.workoutSession.findMany({
        where: { userId, completedAt: { not: null } },
        include: { workout: { select: { title: true, level: true } } },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workoutSession.count({
        where: { userId, completedAt: { not: null } },
      }),
    ]);

    return { sessions, total };
  }
}

// Mock для тестов — не нужна реальная БД
export class MockWorkoutsRepository implements IWorkoutsRepository {
  private workouts: Workout[] = [];
  private sessions: WorkoutSession[] = [];

  async findAll(filter: WorkoutsFilter) {
    const filtered = filter.level
      ? this.workouts.filter((w) => w.level === filter.level)
      : this.workouts;
    return { workouts: filtered, total: filtered.length };
  }
  // ... остальные методы
}
