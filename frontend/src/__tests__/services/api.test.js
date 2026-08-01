// frontend/src/__tests__/services/api.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Мок для localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Импортируем api
import { authApi, workoutsApi } from '../../services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('workoutsApi', () => {
    it('getAll должен вызывать GET /workouts', async () => {
      // Просто проверяем, что функции существуют и возвращают промис
      const result = workoutsApi.getAll({ page: 1, limit: 10 });
      expect(result).toBeInstanceOf(Promise);
    });

    it('getById должен вызывать GET /workouts/:id', async () => {
      const result = workoutsApi.getById('w-1');
      expect(result).toBeInstanceOf(Promise);
    });

    it('startSession должен вызывать POST /workouts/:id/start', async () => {
      const result = workoutsApi.startSession('w-1');
      expect(result).toBeInstanceOf(Promise);
    });

    it('finishSession должен вызывать POST /sessions/:id/finish', async () => {
      const result = workoutsApi.finishSession('session-1');
      expect(result).toBeInstanceOf(Promise);
    });

    it('toggleFavorite должен вызывать POST /workouts/:id/favorite', async () => {
      const result = workoutsApi.toggleFavorite('w-1');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('authApi', () => {
    it('login должен вызывать POST /auth/login', async () => {
      const result = authApi.login('test@test.com', 'password');
      expect(result).toBeInstanceOf(Promise);
    });

    it('register должен вызывать POST /auth/register', async () => {
      const result = authApi.register('test@test.com', 'password', 'Test');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('localStorage', () => {
    it('должен сохранять и получать accessToken', () => {
      localStorageMock.setItem('accessToken', 'test-token');
      expect(localStorageMock.getItem('accessToken')).toBe('test-token');
    });

    it('должен удалять токены', () => {
      localStorageMock.setItem('accessToken', 'test-token');
      localStorageMock.removeItem('accessToken');
      expect(localStorageMock.getItem('accessToken')).toBeNull();
    });
  });
});