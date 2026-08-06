import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Мокаем axios для тестирования API-сервиса.
 */
vi.mock('axios');

// Импортируем API-функции после мока
import {
  finishSession,
  getWorkoutById,
  getWorkouts,
  login,
  register,
  startSession,
} from '../../services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWorkouts', () => {
    it('отправляет GET запрос на /api/workouts', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockData });

      const result = await getWorkouts();

      expect(axios.get).toHaveBeenCalledWith('/api/workouts');
      expect(result).toEqual(mockData);
    });
  });

  describe('getWorkoutById', () => {
    it('отправляет GET запрос на /api/workouts/:id', async () => {
      const mockData = { id: '1', name: 'Test Workout' };
      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockData });

      const result = await getWorkoutById('1');

      expect(axios.get).toHaveBeenCalledWith('/api/workouts/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('startSession', () => {
    it('отправляет POST запрос на /api/workouts/:id/start', async () => {
      const mockSession = { id: 'session-1', workoutId: '1' };
      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockSession });

      const result = await startSession('1');

      expect(axios.post).toHaveBeenCalledWith('/api/workouts/1/start');
      expect(result).toEqual(mockSession);
    });
  });

  describe('finishSession', () => {
    it('отправляет PUT запрос на /api/workouts/:sessionId/finish', async () => {
      const mockResult = { id: 'session-1', finished: true };
      (axios.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResult });

      const result = await finishSession('session-1');

      // ИСПРАВЛЕНО: проверяем корректный URL
      // finishSession(sessionId) вызывает api.put(`/workouts/${sessionId}/finish`)
      // Без префикса /api, так как baseURL уже настроен в axios instance
      expect(axios.put).toHaveBeenCalledWith('/workouts/session-1/finish');
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('отправляет POST запрос на /api/auth/login', async () => {
      const credentials = { email: 'test@test.com', password: 'password123' };
      const mockResponse = { token: 'jwt-token', user: { id: '1', email: 'test@test.com' } };
      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResponse });

      const result = await login(credentials);

      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('отправляет POST запрос на /api/auth/register', async () => {
      const userData = {
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
      };
      const mockResponse = { token: 'jwt-token', user: { id: '2', email: 'new@test.com' } };
      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResponse });

      const result = await register(userData);

      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('обработка ошибок', () => {
    it('пробрасывает ошибку при неудачном запросе', async () => {
      const error = new Error('Network Error');
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(getWorkouts()).rejects.toThrow('Network Error');
    });
  });
});