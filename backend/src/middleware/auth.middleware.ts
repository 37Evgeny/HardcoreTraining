import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest, JwtPayload } from '../shared/types';
import { env } from '../shared/utils/env';
import { AppError } from './errorHandler';

/**
 * authenticate — проверка JWT и существования пользователя в БД.
 * Добавляет user в req, если токен валиден и пользователь реально существует.
 *
 * ИСПРАВЛЕНО: раньше доверял JWT даже для удалённых пользователей,
 * что приводило к 500 (нарушение внешнего ключа) при создании сессии.
 * Теперь возвращает 401, если пользователь удалён из БД.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;

    // Проверка, что пользователь реально существует в БД.
    // Защищает от «мёртвых» токенов после удаления/сброса аккаунта.
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError('Пользователь не найден. Войдите заново.', 401);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) { next(error); return; }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid or expired token', 401));
      return;
    }
    next(error);
  }
};

/**
 * requireAdmin — проверка роли ADMIN.
 * Должен использоваться ПОСЛЕ authenticate.
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    next(new AppError('Admin access required', 403));
    return;
  }
  next();
};