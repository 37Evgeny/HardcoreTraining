import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { JwtPayload } from '../../shared/types';
import { env } from '../../shared/utils/env';
import { LoginInput, RegisterInput } from './auth.validator';

const SALT_ROUNDS = 12;

/**
 * Генерирует access и refresh токены.
 */
const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

/**
 * Регистрация нового пользователя.
 */
export const register = async (input: RegisterInput) => {
  const { email, password, name } = input;

  // Проверка на существующего пользователя
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Создание пользователя
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Генерация токенов
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role as 'USER' | 'ADMIN',
  });

  return { user, ...tokens };
};

/**
 * Логин пользователя.
 */
export const login = async (input: LoginInput) => {
  const { email, password } = input;

  // Поиск пользователя
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Проверка пароля
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Генерация токенов
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role as 'USER' | 'ADMIN',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    ...tokens,
  };
};

/**
 * Обновление access token по refresh token.
 */
export const refresh = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;

    // Проверка, что пользователь все еще существует
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
    });

    return tokens;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid refresh token', 401);
  }
};