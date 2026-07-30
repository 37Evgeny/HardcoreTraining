/**
 * Auth Service Tests
 *
 * Тестирует бизнес-логику аутентификации:
 * - Регистрация нового пользователя
 * - Вход в систему
 * - Обновление токенов (refresh)
 * - Выход из системы (logout)
 *
 * Все внешние зависимости (Prisma, bcrypt, jwt) замоканы.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../middleware/errorHandler';
import * as authService from '../auth.service';

// ============================================================
// Моки для Prisma
// ============================================================
jest.mock('../../../config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

// Мок для bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Мок для jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

// Мок для crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mocked-random-refresh-token'),
  })),
}));

import { prisma } from '../../../config/prisma';

// ============================================================
// Вспомогательные данные
// ============================================================
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: '$2a$12$hashedpassword',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date('2024-01-01'),
};

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

// ============================================================
// Tests
// ============================================================
describe('AuthService', () => {
  // Сбрасываем все моки перед каждым тестом
  beforeEach(() => {
    jest.clearAllMocks();

    // Настройка моков по умолчанию
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$12$hashedpassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mock-access-token');
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('должен успешно регистрировать нового пользователя', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'rt-1',
        token: 'hashed-refresh',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Act
      const result = await authService.register({
        email: 'test@example.com',
        password: 'StrongP@ss1',
        name: 'Test User',
      });

      // Assert
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mocked-random-refresh-token');

      // Проверяем, что пароль был захэширован
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongP@ss1', 12);

      // Проверяем, что пользователь создан в БД
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            password: '$2a$12$hashedpassword',
          }),
        })
      );
    });

    it('должен нормализовать email (приводить к нижнему регистру)', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({ id: 'rt-1' });

      // Act
      await authService.register({
        email: 'TEST@EXAMPLE.COM',
        password: 'StrongP@ss1',
      });

      // Assert: email должен быть приведён к нижнему регистру
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
          }),
        })
      );
    });

    it('должен выбрасывать ошибку 409, если email уже занят', async () => {
      // Arrange: пользователь с таким email уже существует
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'StrongP@ss1',
        })
      ).rejects.toThrow(AppError);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'StrongP@ss1',
        })
      ).rejects.toThrow('Пользователь с таким email уже зарегистрирован');

      // Проверяем, что create НЕ вызывался
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('должен создавать пользователя без имени (name = null)', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: null,
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({ id: 'rt-1' });

      // Act
      await authService.register({
        email: 'test@example.com',
        password: 'StrongP@ss1',
        // name не передан
      });

      // Assert
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: null,
          }),
        })
      );
    });
  });

  // ============================================================
  // login
  // ============================================================
  describe('login', () => {
    it('должен успешно аутентифицировать пользователя', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'rt-1',
      });

      // Act
      const result = await authService.login({
        email: 'test@example.com',
        password: 'StrongP@ss1',
      });

      // Assert
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mocked-random-refresh-token');

      // Проверяем, что пароль был проверен
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'StrongP@ss1',
        mockUser.password
      );
    });

    it('должен выбрасывать ошибку 401 при неверном email', async () => {
      // Arrange: пользователь не найден
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'StrongP@ss1',
        })
      ).rejects.toThrow(AppError);

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'StrongP@ss1',
        })
      ).rejects.toThrow('Неверный email или пароль');
    });

    it('должен выбрасывать ошибку 401 при неверном пароле', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Пароль не совпадает

      // Act & Assert
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow(AppError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow('Неверный email или пароль');
    });

    it('должен нормализовать email при входе', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({ id: 'rt-1' });

      // Act
      await authService.login({
        email: 'TEST@EXAMPLE.COM',
        password: 'StrongP@ss1',
      });

      // Assert: поиск должен быть по нормализованному email
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
        })
      );
    });
  });

  // ============================================================
  // refresh
  // ============================================================
  describe('refresh', () => {
    const mockStoredToken = {
      id: 'rt-1',
      token: '$2b$10$hashedRefreshToken',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 дней
      revokedAt: null,
      createdAt: new Date(),
      user: mockUser,
    };

    it('должен успешно обновлять токены', async () => {
      // Arrange
      (prisma.refreshToken.findMany as jest.Mock).mockResolvedValue([
        mockStoredToken,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Токен совпадает
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({
        ...mockStoredToken,
        revokedAt: new Date(),
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'rt-2',
      });

      // Act
      const result = await authService.refresh('valid-refresh-token');

      // Assert
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mocked-random-refresh-token');

      // Проверяем, что старый токен был отозван (ротация)
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: { revokedAt: expect.any(Date) },
        })
      );

      // Проверяем, что новый токен создан
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку 400, если refresh token не передан', async () => {
      // Act & Assert
      await expect(authService.refresh('')).rejects.toThrow(AppError);
      await expect(authService.refresh('')).rejects.toThrow(
        'Refresh token обязателен'
      );
    });

    it('должен выбрасывать ошибку 401, если токен не найден в БД', async () => {
      // Arrange: в БД нет токенов
      (prisma.refreshToken.findMany as jest.Mock).mockResolvedValue([]);

      // Act & Assert
      await expect(
        authService.refresh('invalid-token')
      ).rejects.toThrow(AppError);

      await expect(authService.refresh('invalid-token')).rejects.toThrow(
        'Невалидный refresh token'
      );
    });

    it('должен выбрасывать ошибку 401, если токен истёк', async () => {
      // Arrange: токен с истёкшим сроком
      const expiredToken = {
        ...mockStoredToken,
        expiresAt: new Date(Date.now() - 1000), // Просрочен на 1 секунду
      };
      (prisma.refreshToken.findMany as jest.Mock).mockResolvedValue([
        expiredToken,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(
        authService.refresh('expired-token')
      ).rejects.toThrow(AppError);

      await expect(authService.refresh('expired-token')).rejects.toThrow(
        'Refresh token истёк'
      );

      // Проверяем, что просроченный токен был отозван
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: { revokedAt: expect.any(Date) },
        })
      );
    });
  });

  // ============================================================
  // logout
  // ============================================================
  describe('logout', () => {
    it('должен отзывать последний refresh токен (один девайс)', async () => {
      // Arrange
      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
        id: 'rt-1',
      });
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});

      // Act
      await authService.logout('user-1', false);

      // Assert
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', revokedAt: null },
          orderBy: { createdAt: 'desc' },
        })
      );
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: { revokedAt: expect.any(Date) },
        })
      );
    });

    it('должен отзывать все refresh токены (все девайсы)', async () => {
      // Arrange
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      // Act
      await authService.logout('user-1', true);

      // Assert
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', revokedAt: null },
          data: { revokedAt: expect.any(Date) },
        })
      );
      // При allDevices=true не должен вызываться findFirst
      expect(prisma.refreshToken.findFirst).not.toHaveBeenCalled();
    });

    it('должен корректно обрабатывать случай, когда нет активных токенов', async () => {
      // Arrange: нет активных токенов
      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

      // Act (не должно быть ошибки)
      await authService.logout('user-1', false);

      // Assert: update не вызывался, т.к. нечего отзывать
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });
  });
});