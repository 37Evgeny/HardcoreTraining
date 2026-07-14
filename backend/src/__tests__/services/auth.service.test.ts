// backend/src/__tests__/services/auth.service.test.ts
// Unit-тесты для AuthService

import { AuthService } from '../../modules/auth/auth.service';
import { AppError } from '../../shared/utils/errors';

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
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockRegisterDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      // Мокаем, что пользователь не найден
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Мокаем создание пользователя
      const mockUser = {
        id: '1',
        email: mockRegisterDto.email,
        name: mockRegisterDto.name,
        createdAt: new Date(),
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Выполняем регистрацию
      const result = await authService.register(mockRegisterDto);

      // Проверяем результат
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockRegisterDto.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error if email already exists', async () => {
      // Мокаем, что пользователь уже существует
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: mockRegisterDto.email,
      });

      // Проверяем, что выбрасывается ошибка
      await expect(
        authService.register(mockRegisterDto),
      ).rejects.toThrow(AppError);
    });

    it('should throw error for weak password', async () => {
      const weakPasswordDto = {
        ...mockRegisterDto,
        password: '123',
      };

      await expect(
        authService.register(weakPasswordDto),
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    const mockLoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
    };

    it('should successfully login with valid credentials', async () => {
      // Мокаем найденного пользователя с хешированным паролем
      const mockUser = {
        id: '1',
        email: mockLoginDto.email,
        password: '$2b$12$...', // Хеш пароля
        name: 'Test User',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Мокаем bcrypt.compare (возвращает true)
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