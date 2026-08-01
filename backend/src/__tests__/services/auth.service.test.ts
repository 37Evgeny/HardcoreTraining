// backend/src/__tests__/services/auth.service.test.ts
// Unit-тесты для AuthService

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middleware/errorHandler';
import * as authService from '../../modules/auth/auth.service';

// ============================================================
// Моки
// ============================================================

// Мокаем Prisma — ВАЖНО: добавляем refreshToken
jest.mock('../../config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      // <-- ДОБАВЛЕНО: без этого generateTokenPair падает
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

// Мокаем bcrypt (чтобы не хешировать реально)
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Мокаем jwt (чтобы не подписывать реально)
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

// Мокаем crypto (чтобы не генерировать реальные байты)
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mocked-random-refresh-token'),
  })),
}));

import { prisma } from '../../config/prisma';

describe('AuthService', () => {
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
    const mockRegisterDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const mockUser = {
        id: '1',
        email: mockRegisterDto.email,
        name: mockRegisterDto.name,
        role: 'USER',
        createdAt: new Date(),
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      // ВАЖНО: мокаем refreshToken.create
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'rt-1',
        token: 'hashed-refresh',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Act
      const result = await authService.register(mockRegisterDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockRegisterDto.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      // Проверяем, что пароль был захэширован
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass123!', 12);
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: mockRegisterDto.email,
      });

      // Act & Assert
      await expect(
        authService.register(mockRegisterDto),
      ).rejects.toThrow(AppError);

      // Проверяем, что create НЕ вызывался
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // login
  // ============================================================
  describe('login', () => {
    const mockLoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: mockLoginDto.email,
        password: '$2b$12$abcdefghijklmnopqrstuv',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'rt-1',
      });

      // Act
      const result = await authService.login(mockLoginDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockLoginDto.email);
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login(mockLoginDto),
      ).rejects.toThrow(AppError);
    });

    it('should throw error for invalid password', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: mockLoginDto.email,
        password: '$2b$12$abcdefghijklmnopqrstuv',
        name: 'Test User',
        role: 'USER',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Пароль не совпадает

      // Act & Assert
      await expect(
        authService.login(mockLoginDto),
      ).rejects.toThrow(AppError);
    });
  });
});