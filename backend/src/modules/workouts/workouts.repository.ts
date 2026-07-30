/**
 * Workouts Repository
 * 
 * Реализует паттерн Repository для абстракции доступа к данным тренировок.
 * Содержит интерфейс IWorkoutsRepository и две реализации:
 * - PrismaWorkoutsRepository — реальная работа с БД
 * - MockWorkoutsRepository — для unit-тестов (in-memory)
 * 
 * @module workoutsRepository
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../shared/utils/logger';

// ============================================================
// Типы
// ============================================================

export interface WorkoutsFilter {
  level?: string;
  page: number;
  limit: number;
}

export interface IWorkoutsRepository {
  findAll(filter: WorkoutsFilter): Promise<{ workouts: any[]; total: number }>;
  findById(id: string): Promise<any | null>;
  createSession(userId: string, workoutId: string): Promise<any>;
  finishSession(sessionId: string, userId: string): Promise<any>;
  findSessionHistory(
    userId: string, 
    page: number, 
    limit: number
  ): Promise<{ sessions: any[]; total: number }>;
}

// ============================================================
// Prisma-реализация (production)
// ============================================================

/**
 * Реализация репозитория через Prisma ORM.
 * Все запросы к БД выполняются через Prisma Client.
 */
export class PrismaWorkoutsRepository implements IWorkoutsRepository {
  
  /**
   * Получение списка тренировок с пагинацией и фильтрацией.
   * 
   * @param filter - { level?, page, limit }
   * @returns { workouts, total } — массив тренировок и общее количество
   */
  async findAll({ level, page, limit }: WorkoutsFilter) {
    // Формируем where-условие: если level указан, фильтруем по нему
    const where: Prisma.WorkoutWhereInput = level 
      ? { level: level as any } 
      : {};
    
    const skip = (page - 1) * limit;

    // Используем транзакцию для атомарности (findMany + count)
    const [workouts, total] = await prisma.$transaction([
      prisma.workout.findMany({
        where,
        include: { 
          exercises: {
            orderBy: { createdAt: 'asc' as const }, // Сортируем упражнения по дате создания
          } 
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as const }, // Сначала новые тренировки
      }),
      prisma.workout.count({ where }),
    ]);

    logger.debug(`Found ${workouts.length} workouts (total: ${total})`);
    return { workouts, total };
  }

  /**
   * Поиск тренировки по ID.
   * 
   * @param id - UUID тренировки
   * @returns тренировка с упражнениями или null
   */
  async findById(id: string) {
    return prisma.workout.findUnique({
      where: { id },
      include: { 
        exercises: {
          orderBy: { createdAt: 'asc' as const },
        } 
      },
    });
  }

  /**
   * Создание новой сессии тренировки.
   * Проверяет, нет ли уже активной сессии у пользователя.
   * 
   * @param userId - ID пользователя
   * @param workoutId - ID тренировки
   * @returns созданная сессия с включёнными данными тренировки
   * @throws AppError 409 если есть активная сессия
   */
  async createSession(userId: string, workoutId: string) {
    // Проверяем, нет ли уже активной (незавершённой) сессии
    const activeSession = await prisma.workoutSession.findFirst({
      where: { 
        userId, 
        completed: false,
      },
    });

    if (activeSession) {
      logger.warn(`User ${userId} already has active session ${activeSession.id}`);
      throw new AppError('У вас уже есть активная тренировка. Завершите её перед началом новой.', 409);
    }

    const session = await prisma.workoutSession.create({
      data: { 
        userId, 
        workoutId,
      },
      include: { 
        workout: { 
          include: { 
            exercises: {
              orderBy: { createdAt: 'asc' as const },
            } 
          } 
        } 
      },
    });

    logger.info(`Session created: ${session.id} for user ${userId}`);
    return session;
  }

  /**
   * Завершение сессии тренировки.
   * 
   * @param sessionId - ID сессии
   * @param userId - ID пользователя (для проверки владельца)
   * @returns обновлённая сессия с completed=true и finishedAt
   * @throws AppError 404 если сессия не найдена
   * @throws AppError 403 если сессия принадлежит другому пользователю
   * @throws AppError 409 если сессия уже завершена
   */
  async finishSession(sessionId: string, userId: string) {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError('Сессия не найдена', 404);
    }

    if (session.userId !== userId) {
      logger.warn(`User ${userId} tried to finish session ${sessionId} owned by ${session.userId}`);
      throw new AppError('У вас нет прав на завершение этой сессии', 403);
    }

    if (session.completed) {
      throw new AppError('Сессия уже завершена', 409);
    }

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

    logger.info(`Session ${sessionId} finished by user ${userId}`);
    return updatedSession;
  }

  /**
   * История завершённых сессий пользователя с пагинацией.
   * 
   * @param userId - ID пользователя
   * @param page - номер страницы
   * @param limit - элементов на странице
   * @returns { sessions, total }
   */
  async findSessionHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await prisma.$transaction([
      prisma.workoutSession.findMany({
        where: { 
          userId, 
          completed: true,
        },
        include: { 
          workout: { 
            select: { 
              title: true, 
              level: true,
            } 
          } 
        },
        orderBy: { finishedAt: 'desc' as const }, // Сначала последние
        skip,
        take: limit,
      }),
      prisma.workoutSession.count({ 
        where: { userId, completed: true },
      }),
    ]);

    return { sessions, total };
  }
}

// ============================================================
// Mock-реализация (для unit-тестов)
// ============================================================

/**
 * In-memory реализация репозитория для unit-тестов.
 * Не требует подключения к БД.
 */
export class MockWorkoutsRepository implements IWorkoutsRepository {
  private workouts: any[] = [];
  private sessions: any[] = [];
  private sessionCounter = 0;

  /**
   * Заполнение тестовыми данными.
   */
  seed(workouts: any[]) {
    this.workouts = workouts;
  }

  /**
   * Получение всех тренировок (для тестов).
   */
  getAll() {
    return this.workouts;
  }

  /**
   * Установка активной сессии (для тестов).
   */
  setActiveSession(userId: string, sessionId: string) {
    this.sessions.push({ 
      id: sessionId, 
      userId, 
      completed: false,
      finishedAt: null,
      createdAt: new Date(),
    });
  }

  /**
   * Добавление сессии в память (для тестов).
   */
  setSession(session: any) {
    this.sessions.push({
      ...session,
      finishedAt: session.finishedAt || null,
      createdAt: session.createdAt || new Date(),
    });
  }

  async findAll({ level, page, limit }: WorkoutsFilter) {
    let filtered = this.workouts;
    if (level) {
      filtered = this.workouts.filter((w: any) => w.level === level);
    }
    const start = (page - 1) * limit;
    return {
      workouts: filtered.slice(start, start + limit),
      total: filtered.length,
    };
  }

  async findById(id: string) {
    return this.workouts.find((w: any) => w.id === id) || null;
  }

  async createSession(userId: string, workoutId: string) {
    const active = this.sessions.find(
      (s: any) => s.userId === userId && !s.completed
    );
    if (active) {
      throw new AppError('Активная сессия уже существует', 409);
    }
    
    this.sessionCounter++; // <-- ИСПРАВЛЕНО: используем счётчик вместо Date.now()
    const session = { 
      id: `session-${this.sessionCounter}`, 
      userId, 
      workoutId, 
      completed: false,
      finishedAt: null,
      createdAt: new Date(),
    };
    this.sessions.push(session);
    return session;
  }

  async finishSession(sessionId: string, userId: string) {
    const session = this.sessions.find((s: any) => s.id === sessionId);
    if (!session) throw new AppError('Сессия не найдена', 404);
    if (session.userId !== userId) throw new AppError('Доступ запрещён', 403);
    if (session.completed) throw new AppError('Сессия уже завершена', 409);
    
    session.completed = true;
    session.finishedAt = new Date();
    return session;
  }

  async findSessionHistory(userId: string, page: number, limit: number) {
    const userSessions = this.sessions.filter(
      (s: any) => s.userId === userId && s.completed
    );
    const start = (page - 1) * limit;
    return { 
      sessions: userSessions.slice(start, start + limit), 
      total: userSessions.length,
    };
  }
}