/**
 * Workouts Repository Tests
 *
 * Тестирует PrismaWorkoutsRepository:
 * - findAll с пагинацией и фильтрацией
 * - findById
 * - createSession (с проверкой активной сессии)
 * - finishSession (с проверкой владельца и статуса)
 * - findSessionHistory с пагинацией
 *
 * Использует MockWorkoutsRepository (in-memory) для изоляции от БД.
 */
import { AppError } from '../../../middleware/errorHandler';
import { MockWorkoutsRepository } from '../workouts.repository';

// ============================================================
// Тестовые данные
// ============================================================
const mockWorkouts = [
  {
    id: 'w-1',
    title: 'Foundation Beginner',
    level: 'BEGINNER',
    exercises: [
      { id: 'e-1', name: 'Swing', sets: 3, reps: 10 },
      { id: 'e-2', name: 'Goblet Squat', sets: 3, reps: 8 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'w-2',
    title: 'Strength Intermediate',
    level: 'INTERMEDIATE',
    exercises: [
      { id: 'e-3', name: 'Clean & Press', sets: 4, reps: 6 },
    ],
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 'w-3',
    title: 'Advanced Kettlebell',
    level: 'ADVANCED',
    exercises: [],
    createdAt: new Date('2024-01-03'),
  },
  {
    id: 'w-4',
    title: 'Beginner Cardio',
    level: 'BEGINNER',
    exercises: [],
    createdAt: new Date('2024-01-04'),
  },
];

// ============================================================
// Tests
// ============================================================
describe('PrismaWorkoutsRepository (через MockWorkoutsRepository)', () => {
  let repository: MockWorkoutsRepository;

  // Создаём свежий репозиторий перед каждым тестом
  beforeEach(() => {
    repository = new MockWorkoutsRepository();
    repository.seed(mockWorkouts);
  });

  // ============================================================
  // findAll
  // ============================================================
  describe('findAll', () => {
    it('должен возвращать все тренировки с пагинацией', async () => {
      // Act: страница 1, по 2 элемента
      const result = await repository.findAll({ page: 1, limit: 2 });

      // Assert
      expect(result.workouts).toHaveLength(2);
      expect(result.total).toBe(4);
    });

    it('должен возвращать вторую страницу', async () => {
      // Act
      const result = await repository.findAll({ page: 2, limit: 2 });

      // Assert
      expect(result.workouts).toHaveLength(2); // 4 всего, 2 на первой, 2 на второй
      expect(result.workouts[0].id).toBe('w-3');
      expect(result.workouts[1].id).toBe('w-4');
    });

    it('должен возвращать пустой массив для страницы за пределами', async () => {
      // Act
      const result = await repository.findAll({ page: 10, limit: 2 });

      // Assert
      expect(result.workouts).toHaveLength(0);
      expect(result.total).toBe(4);
    });

    it('должен фильтровать тренировки по уровню', async () => {
      // Act
      const result = await repository.findAll({
        level: 'BEGINNER',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.workouts).toHaveLength(2);
      expect(result.total).toBe(2);
      result.workouts.forEach((w: any) => {
        expect(w.level).toBe('BEGINNER');
      });
    });

    it('должен возвращать пустой результат для несуществующего уровня', async () => {
      // Act
      const result = await repository.findAll({
        level: 'EXPERT',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.workouts).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('должен находить тренировку по ID', async () => {
      // Act
      const workout = await repository.findById('w-1');

      // Assert
      expect(workout).not.toBeNull();
      expect(workout?.id).toBe('w-1');
      expect(workout?.title).toBe('Foundation Beginner');
    });

    it('должен возвращать null для несуществующего ID', async () => {
      // Act
      const workout = await repository.findById('nonexistent');

      // Assert
      expect(workout).toBeNull();
    });
  });

  // ============================================================
  // createSession
  // ============================================================
  describe('createSession', () => {
    it('должен успешно создавать сессию', async () => {
      // Act
      const session = await repository.createSession('user-1', 'w-1');

      // Assert
      expect(session.userId).toBe('user-1');
      expect(session.workoutId).toBe('w-1');
      expect(session.completed).toBe(false);
      expect(session.id).toMatch(/^session-/);
    });

    it('должен выбрасывать ошибку 409, если есть активная сессия', async () => {
      // Arrange: создаём активную сессию
      repository.setActiveSession('user-1', 'active-session');

      // Act & Assert
      await expect(
        repository.createSession('user-1', 'w-2')
      ).rejects.toThrow(AppError);

      await expect(
        repository.createSession('user-1', 'w-2')
      ).rejects.toThrow('Активная сессия уже существует');
    });

    it('должен разрешать создавать сессию, если предыдущая завершена', async () => {
      // Arrange: создаём и завершаем сессию
      const session1 = await repository.createSession('user-1', 'w-1');
      await repository.finishSession(session1.id, 'user-1');

      // Act: создаём новую сессию
      const session2 = await repository.createSession('user-1', 'w-2');

      // Assert
      expect(session2.id).not.toBe(session1.id);
      expect(session2.completed).toBe(false);
    });
  });

  // ============================================================
  // finishSession
  // ============================================================
  describe('finishSession', () => {
    it('должен успешно завершать сессию', async () => {
      // Arrange
      const session = await repository.createSession('user-1', 'w-1');

      // Act
      const finished = await repository.finishSession(session.id, 'user-1');

      // Assert
      expect(finished.completed).toBe(true);
      expect(finished.finishedAt).toBeInstanceOf(Date);
    });

    it('должен выбрасывать ошибку 404, если сессия не найдена', async () => {
      // Act & Assert
      await expect(
        repository.finishSession('nonexistent', 'user-1')
      ).rejects.toThrow(AppError);

      await expect(
        repository.finishSession('nonexistent', 'user-1')
      ).rejects.toThrow('Сессия не найдена');
    });

    it('должен выбрасывать ошибку 403, если сессия принадлежит другому пользователю', async () => {
      // Arrange
      const session = await repository.createSession('user-1', 'w-1');

      // Act & Assert: пытаемся завершить от имени другого пользователя
      await expect(
        repository.finishSession(session.id, 'user-2')
      ).rejects.toThrow(AppError);

      await expect(
        repository.finishSession(session.id, 'user-2')
      ).rejects.toThrow('Доступ запрещён');
    });

    it('должен выбрасывать ошибку 409, если сессия уже завершена', async () => {
      // Arrange
      const session = await repository.createSession('user-1', 'w-1');
      await repository.finishSession(session.id, 'user-1');

      // Act & Assert: пытаемся завершить уже завершённую
      await expect(
        repository.finishSession(session.id, 'user-1')
      ).rejects.toThrow(AppError);

      await expect(
        repository.finishSession(session.id, 'user-1')
      ).rejects.toThrow('Сессия уже завершена');
    });
  });

  // ============================================================
  // findSessionHistory
  // ============================================================
  describe('findSessionHistory', () => {
    it('должен возвращать историю завершённых сессий', async () => {
      // Arrange: создаём и завершаем 2 сессии
      const s1 = await repository.createSession('user-1', 'w-1');
      await repository.finishSession(s1.id, 'user-1');

      const s2 = await repository.createSession('user-1', 'w-2');
      await repository.finishSession(s2.id, 'user-1');

      // Act
      const result = await repository.findSessionHistory('user-1', 1, 10);

      // Assert
      expect(result.sessions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('должен игнорировать незавершённые сессии', async () => {
      // Arrange: создаём сессию, но НЕ завершаем
      await repository.createSession('user-1', 'w-1');

      // Act
      const result = await repository.findSessionHistory('user-1', 1, 10);

      // Assert
      expect(result.sessions).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('должен возвращать только сессии указанного пользователя', async () => {
      // Arrange
      const s1 = await repository.createSession('user-1', 'w-1');
      await repository.finishSession(s1.id, 'user-1');

      const s2 = await repository.createSession('user-2', 'w-2');
      await repository.finishSession(s2.id, 'user-2');

      // Act
      const resultUser1 = await repository.findSessionHistory('user-1', 1, 10);
      const resultUser2 = await repository.findSessionHistory('user-2', 1, 10);

      // Assert
      expect(resultUser1.sessions).toHaveLength(1);
      expect(resultUser2.sessions).toHaveLength(1);
    });

    it('должен поддерживать пагинацию в истории', async () => {
      // Arrange: создаём 3 завершённые сессии
      for (let i = 0; i < 3; i++) {
        const s = await repository.createSession('user-1', `w-${i + 1}`);
        await repository.finishSession(s.id, 'user-1');
      }

      // Act: страница 1, по 2 элемента
      const page1 = await repository.findSessionHistory('user-1', 1, 2);
      const page2 = await repository.findSessionHistory('user-1', 2, 2);

      // Assert
      expect(page1.sessions).toHaveLength(2);
      expect(page1.total).toBe(3);
      expect(page2.sessions).toHaveLength(1);
      expect(page2.total).toBe(3);
    });
  });
});