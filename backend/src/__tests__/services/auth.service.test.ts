// backend/src/__tests__/services/auth.service.test.ts
// Unit-тесты для AuthService

import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/errorHandler';
import * as authService from '../../modules/auth/auth.service';

// Мокаем Prisma
jest.mock('../../config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '../../config/prisma';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockRegisterDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const mockUser = {
        id: '1',
        email: mockRegisterDto.email,
        name: mockRegisterDto.name,
        role: 'USER',
        createdAt: new Date(),
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register(mockRegisterDto);

      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockRegisterDto.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: mockRegisterDto.email,
      });

      await expect(
        authService.register(mockRegisterDto),
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    const mockLoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: mockLoginDto.email,
        password: '$2b$12$abcdefghijklmnopqrstuv', // Хеш пароля
        name: 'Test User',
        role: 'USER',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Мокаем bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.login(mockLoginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login(mockLoginDto),
      ).rejects.toThrow(AppError);
    });
  });
});