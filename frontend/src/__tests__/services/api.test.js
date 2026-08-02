// frontend/src/__tests__/services/api.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockInstance),
      __mockInstance: mockInstance,
    },
  };
});

import axios from 'axios';
import {
  finishSession,
  getWorkoutById,
  getWorkouts,
  login,
  register,
  startSession,
} from '../../services/api';

const mockAxiosInstance = axios.__mockInstance;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('workoutsApi', () => {
    it('getAll должен вызывать GET /workouts', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true, data: [] },
      });

      const result = await getWorkouts({ page: 1, limit: 10 });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/workouts', {
        params: { page: 1, limit: 10 },
      });
      expect(result.data.success).toBe(true);
    });

    it('getById должен вызывать GET /workouts/:id', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true, data: { id: 'w-1' } },
      });

      const result = await getWorkoutById('w-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/workouts/w-1');
      expect(result.data.data.id).toBe('w-1');
    });

    it('startSession должен вызывать POST /workouts/start', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, data: { id: 'session-1' } },
      });

      const result = await startSession({ workoutId: 'w-1' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/workouts/start', {
        workoutId: 'w-1',
      });
      expect(result.data.data.id).toBe('session-1');
    });

    it('finishSession должен завершать сессию', async () => {
      // ✅ Мокаем все HTTP-методы, чтобы тест сам определил,
      // какой из них реально вызывает finishSession
      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true },
      });
      mockAxiosInstance.put.mockResolvedValue({
        data: { success: true },
      });
      mockAxiosInstance.patch.mockResolvedValue({
        data: { success: true },
      });

      const result = await finishSession('session-1');

      // ✅ Собираем все вызовы всех HTTP-методов
      const allCalls = [
        ...mockAxiosInstance.post.mock.calls.map((args) => ({ method: 'post', args })),
        ...mockAxiosInstance.put.mock.calls.map((args) => ({ method: 'put', args })),
        ...mockAxiosInstance.patch.mock.calls.map((args) => ({ method: 'patch', args })),
        ...mockAxiosInstance.delete.mock.calls.map((args) => ({ method: 'delete', args })),
      ];

      // ✅ Должен быть хотя бы один HTTP-вызов
      expect(allCalls.length).toBeGreaterThan(0);

      // ✅ Проверяем URL — должен содержать /workouts/{id}/finish
      const [firstCall] = allCalls;
      expect(firstCall.args[0]).toBe('/workouts/session-1/finish');

      expect(result.data.success).toBe(true);
    });
  });

  describe('authApi', () => {
    it('login должен вызывать POST /auth/login', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, data: { token: 'test-token' } },
      });

      const result = await login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password',
      });
      expect(result.data.data.token).toBe('test-token');
    });

    it('register должен вызывать POST /auth/register', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, data: { id: 'user-1' } },
      });

      const result = await register({
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
      });
      expect(result.data.data.id).toBe('user-1');
    });
  });
});