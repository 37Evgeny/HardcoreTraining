/**
 * Auth Service
 *
 * Отвечает за регистрацию, аутентификацию, refresh токенов и logout.
 * Использует bcryptjs для хеширования, jsonwebtoken для access token,
 * crypto.randomBytes для генерации refresh token.
 *
 * @module authService
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../shared/utils/env';
import { logger } from '../../shared/utils/logger';

const SALT_ROUNDS = 12;

/**
 * Регистрация нового пользователя.
 * name — опционально. email приводится к нижнему регистру.
 */
export const register = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string | null;
}) => {
  try {
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new AppError('Пользователь с таким email уже зарегистрирован', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        name: name ?? null,
      },
    });

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, SALT_ROUNDS);

    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`[AUTH] Пользователь зарегистрирован: ${normalizedEmail}`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('[AUTH] Ошибка регистрации:', error);
    throw new AppError('Внутренняя ошибка сервера', 500);
  }
};

/**
 * Вход пользователя в систему.
 */
export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new AppError('Неверный email или пароль', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Неверный email или пароль', 401);
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, SALT_ROUNDS);

    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`[AUTH] Пользователь вошёл: ${email}`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('[AUTH] Ошибка входа:', error);
    throw new AppError('Внутренняя ошибка сервера', 500);
  }
};

/**
 * Обновление access token по refresh token (ротация токенов).
 * Ищет активный refresh token в БД, сверяет через bcrypt,
 * отзывает старый и создаёт новый.
 */
export const refresh = async (token: string) => {
  try {
    if (!token) {
      throw new AppError('Refresh token обязателен', 400);
    }

    // Ищем все активные (не отозванные) refresh токены
    const storedTokens = await prisma.refreshToken.findMany({
      where: { revokedAt: null },
      include: { user: true },
    });

    // Ищем среди них тот, который соответствует переданному токену
    let matchedToken = null;
    for (const stored of storedTokens) {
      const isValid = await bcrypt.compare(token, stored.token);
      if (isValid) {
        matchedToken = stored;
        break;
      }
    }

    if (!matchedToken) {
      throw new AppError('Невалидный refresh token', 401);
    }

    // Проверяем срок действия
    if (new Date() > matchedToken.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: matchedToken.id },
        data: { revokedAt: new Date() },
      });
      throw new AppError('Refresh token истёк', 401);
    }

    // Отзываем старый токен (ротация)
    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    // Генерируем новую пару токенов
    const accessToken = jwt.sign(
      { userId: matchedToken.user.id, email: matchedToken.user.email },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, SALT_ROUNDS);

    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: matchedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('[AUTH] Ошибка refresh токена:', error);
    throw new AppError('Внутренняя ошибка сервера', 500);
  }
};

/**
 * Выход пользователя из системы (инвалидация refresh токенов).
 * @param userId - ID пользователя
 * @param allSessions - true = отозвать все сессии, false = только последнюю
 */
export const logout = async (userId: string, allSessions: boolean = false) => {
  try {
    if (allSessions) {
      // Отзываем все активные токены пользователя
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      logger.info(`[AUTH] Пользователь ${userId} вышел из всех сессий`);
    } else {
      // Находим последний активный токен
      const lastToken = await prisma.refreshToken.findFirst({
        where: { userId, revokedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      if (lastToken) {
        // Отзываем только его
        await prisma.refreshToken.update({
          where: { id: lastToken.id },
          data: { revokedAt: new Date() },
        });
      }
      // Если токена нет — ничего не делаем (не ошибка)
      logger.info(`[AUTH] Пользователь ${userId} вышел из текущей сессии`);
    }
  } catch (error) {
    logger.error('[AUTH] Ошибка logout:', error);
    throw new AppError('Ошибка при выходе из системы', 500);
  }
};

/**
 * Объект-сервис для удобства (совместимость с import { authService }).
 */
export const authService = { register, login, refresh, logout };
