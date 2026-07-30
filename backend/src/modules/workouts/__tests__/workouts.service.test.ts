import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { MockWorkoutsRepository } from '../workouts.repository';
import { WorkoutsService } from '../workouts.service';

/**
 * Unit тест сервиса — нет реальной БД, нет HTTP.
 * Быстро (< 50ms), детерминировано, изолировано.
 */
describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let mockRepo: MockWorkoutsRepository;

  beforeEach(() => {
    mockRepo = new MockWorkoutsRepository();
    service = new WorkoutsService(mockRepo); // DI через конструктор
  });

  describe('getWorkouts', () => {
    it('returns paginated workouts without filter', async () => {
      mockRepo.seed(createMockWorkouts(15)); // 15 тренировок в mock

      const result = await service.getWorkouts({ page: 1, limit: 10 });

      expect(result.workouts).toHaveLength(10);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
    });

    it('filters workouts by level', async () => {
      mockRepo.seed([
        ...createMockWorkouts(5, 'BEGINNER'),
        ...createMockWorkouts(5, 'ADVANCED'),
      ]);

      const result = await service.getWorkouts({ level: 'BEGINNER', page: 1, limit: 20 });

      expect(result.workouts).toHaveLength(5);
      expect(result.workouts.every((w) => w.level === 'BEGINNER')).toBe(true);
    });
  });

  describe('startSession', () => {
    it('throws ConflictError if active session exists', async () => {
      mockRepo.setActiveSession('user-1', 'session-active');

      await expect(
        service.startSession('user-1', 'workout-1')
      ).rejects.toThrow(ConflictError);
    });

    it('creates session successfully', async () => {
      mockRepo.seed(createMockWorkouts(1));
      const workout = mockRepo.getAll()[0];

      const session = await service.startSession('user-1', workout.id);

      expect(session.userId).toBe('user-1');
      expect(session.workoutId).toBe(workout.id);
      expect(session.completedAt).toBeNull();
    });
  });

  describe('finishSession', () => {
    it('sets completedAt on session', async () => {
      const sessionId = 'session-123';
      mockRepo.setSession({ id: sessionId, userId: 'user-1', completedAt: null });

      const result = await service.finishSession(sessionId, 'user-1');

      expect(result.completedAt).not.toBeNull();
    });

    it('throws NotFoundError for wrong user', async () => {
      mockRepo.setSession({ id: 'session-123', userId: 'user-1', completedAt: null });

      await expect(
        service.finishSession('session-123', 'user-2') // Чужая сессия
      ).rejects.toThrow(NotFoundError);
    });
  });
});

