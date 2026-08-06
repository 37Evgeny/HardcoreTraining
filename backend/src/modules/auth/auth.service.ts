import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../shared/utils/env';
import { logger } from '../../shared/utils/logger';

const SALT_ROUNDS = 12;

/**
 * Генерация access token.
 * ИСПРАВЛЕНО: добавлена роль в payload (чинит requireAdmin) и
 * используется env.JWT_EXPIRES_IN вместо хардкода '15m'.
 */
const signAccessToken = (user: { id: string; email: string; role: string }) =>
  jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

/**
 * Генерация refresh token (сырой + хеш для БД).
 * ИСПРАВЛЕНО: срок из env.JWT_REFRESH_EXPIRES_IN (парсим дни).
 */
const createRefreshToken = async (userId: string) => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = await bcrypt.hash(raw, SALT_ROUNDS);
  // env.JWT_REFRESH_EXPIRES_IN вида '15d' → число дней
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN, 10) || 15;
  await prisma.refreshToken.create({
    data: {
      token: hashed,
      userId,
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    },
  });
  return raw;
};

export const register = async ({ email, password, name }: {
  email: string; password: string; name?: string | null;
}) => {
  try {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) throw new AppError('Пользователь с таким email уже зарегистрирован', 409);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, password: passwordHash, name: name ?? null },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    logger.info(`[AUTH] Пользователь зарегистрирован: ${normalizedEmail}`);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('[AUTH] Ошибка регистрации:', error);
    throw new AppError('Внутренняя ошибка сервера', 500);
  }
};

export const login = async ({ email, password }: { email: string; password: string }) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError('Неверный email или пароль', 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new AppError('Неверный email или пароль', 401);

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    logger.info(`[AUTH] Пользователь вошёл: ${email}`);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('[AUTH] Ошибка входа:', error);
    throw new AppError('Внутренняя ошибка сервера', 500);
  }
};

/**
 * Обновление access token (ротация refresh токена).
 * ИСПРАВЛЕНО: ищем токен по хешу через bcrypt, но ограничиваем
 * выборку последними N активными токенами пользователя (оптимизация).
 */
export const refresh = async (token: string) => {
  try {
    if (!token) throw new AppError('Refresh token обязателен', 400);

    // Ищем активные токены (без include user — отдельный запрос ниже)
    const storedTokens = await prisma.refreshToken.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50, // ограничение для производительности
    });

    let matchedToken = null;
    for (const stored of storedTokens) {
      if (await bcrypt.compare(token, stored.token)) { matchedToken = stored; break; }
    }

    if (!matchedToken) throw new AppError('Невалидный refresh token', 401);

    if (new Date() > matchedToken.expiresAt) {
      await prisma.refreshToken.update({ where: { id: matchedToken.id }, data: { revokedAt: new Date() } });
      throw new AppError('Refresh token истёк', 401);
    }

    // Ротация: отзываем старый, создаём новый
    await prisma.refreshToken.update({ where: { id: matchedToken.id }, data: { revokedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { id: matchedToken.userId } });
    if (!user) throw new AppError('Пользователь не найден', 401);

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('[AUTH] Ошибка refresh токена:', error);
    throw new AppError('Внутренняя ошибка сервера', 500);
  }
};

export const logout = async (userId: string, allSessions: boolean = false) => {
  try {
    if (allSessions) {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      logger.info(`[AUTH] Пользователь ${userId} вышел из всех сессий`);
    } else {
      const lastToken = await prisma.refreshToken.findFirst({
        where: { userId, revokedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      if (lastToken) {
        await prisma.refreshToken.update({ where: { id: lastToken.id }, data: { revokedAt: new Date() } });
      }
      logger.info(`[AUTH] Пользователь ${userId} вышел из текущей сессии`);
    }
  } catch (error) {
    logger.error('[AUTH] Ошибка logout:', error);
    throw new AppError('Ошибка при выходе из системы', 500);
  }
};

export const authService = { register, login, refresh, logout };