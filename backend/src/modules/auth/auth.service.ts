/**
 * Auth Service
 * 
 * Отвечает за регистрацию, аутентификацию и управление токенами.
 * Использует bcryptjs для хеширования паролей и jsonwebtoken для JWT.
 * Refresh token хранится в БД в виде bcrypt-хеша (защита от утечки БД).
 * 
 * @module authService
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../shared/utils/env';
import { logger } from '../../shared/utils/logger';

// ============================================================
// Типы
// ============================================================

interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

// ============================================================
// Публичные функции
// ============================================================

/**
 * Регистрация нового пользователя.
 * 
 * @param input - { email, password, name? }
 * @returns объект с данными пользователя и токенами
 * @throws AppError 409 если email уже занят
 */
export const register = async (input: RegisterInput) => {
  const { email, password, name } = input;

  // 1. Нормализация email (приводим к нижнему регистру)
  const normalizedEmail = email.toLowerCase().trim();

  // 2. Проверка, не занят ли email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    logger.warn(`Registration attempt with existing email: ${normalizedEmail}`);
    throw new AppError('Пользователь с таким email уже зарегистрирован', 409);
  }

  // 3. Хеширование пароля (12 раундов соли — баланс безопасности и скорости)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 4. Создание пользователя в БД
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
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

  // 5. Генерация токенов
  const tokens = await generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role as 'USER' | 'ADMIN',
  });

  logger.info(`User registered: ${user.email}`);

  return { user, ...tokens };
};

/**
 * Вход в систему.
 * 
 * @param input - { email, password }
 * @returns объект с данными пользователя и токенами
 * @throws AppError 401 если email или пароль неверны
 */
export const login = async (input: LoginInput) => {
  const { email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Поиск пользователя по email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    logger.warn(`Login attempt with non-existent email: ${normalizedEmail}`);
    throw new AppError('Неверный email или пароль', 401);
  }

  // 2. Проверка пароля (constant-time сравнение через bcrypt)
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    logger.warn(`Failed login attempt for: ${normalizedEmail}`);
    throw new AppError('Неверный email или пароль', 401);
  }

  // 3. Генерация токенов
  const tokens = await generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role as 'USER' | 'ADMIN',
  });

  logger.info(`User logged in: ${user.email}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
    ...tokens,
  };
};

/**
 * Обновление access token через refresh token.
 * Реализована ротация токенов (старый отзывается, выдаётся новый).
 * Защита от replay attack: каждый refresh token можно использовать только один раз.
 * 
 * @param oldRefreshToken - текущий refresh token
 * @returns новая пара токенов
 * @throws AppError 400/401 если токен невалиден или истёк
 */
export const refresh = async (oldRefreshToken: string) => {
  if (!oldRefreshToken) {
    throw new AppError('Refresh token обязателен', 400);
  }

  // 1. Получаем все активные (не отозванные) refresh токены
  const storedTokens = await prisma.refreshToken.findMany({
    where: { revokedAt: null },
    include: { user: true },
  });

  // 2. Ищем совпадение по bcrypt-хешу
  //    (в БД хранится хеш, а не сам токен — защита от утечки)
  let matchedToken = null;
  for (const stored of storedTokens) {
    const isMatch = await bcrypt.compare(oldRefreshToken, stored.token);
    if (isMatch) {
      matchedToken = stored;
      break;
    }
  }

  if (!matchedToken) {
    logger.warn('Refresh token reuse attempt — possible token theft');
    throw new AppError('Невалидный refresh token', 401);
  }

  // 3. Проверка срока жизни токена
  if (matchedToken.expiresAt < new Date()) {
    // Отзываем просроченный токен
    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });
    logger.warn('Expired refresh token used');
    throw new AppError('Refresh token истёк. Выполните вход заново.', 401);
  }

  // 4. Ротация: отзываем старый токен
  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { revokedAt: new Date() },
  });

  // 5. Генерируем новую пару токенов
  const tokens = await generateTokenPair({
    userId: matchedToken.user.id,
    email: matchedToken.user.email,
    role: matchedToken.user.role as 'USER' | 'ADMIN',
  });

  logger.info(`Tokens refreshed for user: ${matchedToken.user.email}`);

  return tokens;
};

/**
 * Выход из системы — отзыв refresh токенов.
 * 
 * @param userId - ID пользователя
 * @param allDevices - если true, отзываются все токены пользователя
 */
export const logout = async (userId: string, allDevices = false) => {
  const where = {
    userId,
    revokedAt: null,
    ...(allDevices ? {} : {}), // Если allDevices=false, отзываем только последний
  };

  // Если не allDevices, отзываем только самый свежий токен
  if (!allDevices) {
    const latestToken = await prisma.refreshToken.findFirst({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (latestToken) {
      await prisma.refreshToken.update({
        where: { id: latestToken.id },
        data: { revokedAt: new Date() },
      });
    }
  } else {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  logger.info(`User logged out: ${userId} (allDevices: ${allDevices})`);
};

// ============================================================
// Приватные вспомогательные функции
// ============================================================

/**
 * Генерация пары токенов (access + refresh).
 * 
 * Access token — JWT с коротким сроком жизни.
 * Refresh token — случайная строка, хранится в БД в виде bcrypt-хеша.
 * 
 * @param payload - данные для включения в JWT
 * @returns { accessToken, refreshToken }
 */
async function generateTokenPair(payload: TokenPayload): Promise<AuthTokens> {
  // Access token (короткоживущий, 15 минут по умолчанию)
const accessToken = jwt.sign(
  { userId: payload.userId, email: payload.email, role: payload.role },
  env.JWT_SECRET,
  { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions // <-- приведение всего объекта
);

  // Refresh token (длинноживущий, 7 дней по умолчанию)
  // Используем криптостойкий генератор случайных чисел
  const refreshTokenValue = crypto.randomBytes(64).toString('hex');
  
  // Вычисляем дату истечения
  const expiresAt = new Date(
    Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN)
  );

  // Сохраняем bcrypt-хеш refresh token в БД (не сам токен!)
  // Это защита: даже при утечке БД злоумышленник не получит токены
  await prisma.refreshToken.create({
    data: {
      token: await bcrypt.hash(refreshTokenValue, 10),
      userId: payload.userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: refreshTokenValue };
}

/**
 * Парсинг строки длительности в миллисекунды.
 * Поддерживает форматы: "15m", "7d", "1h", "30s"
 * 
 * @param duration - строка вида "15m", "7d", "1h"
 * @returns количество миллисекунд
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  
  if (!match) {
    // Значение по умолчанию: 7 дней
    logger.warn(`Invalid duration format: "${duration}", using default 7d`);
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000; // дни
    case 'h': return value * 60 * 60 * 1000;      // часы
    case 'm': return value * 60 * 1000;            // минуты
    case 's': return value * 1000;                 // секунды
    default:
      logger.warn(`Unknown time unit: "${unit}", using default 7d`);
      return 7 * 24 * 60 * 60 * 1000;
  }
}