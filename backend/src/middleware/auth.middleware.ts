import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../shared/types';
import { env } from '../shared/utils/env';
import { AppError } from './errorHandler';

/**
 * authenticate — проверка JWT.
 * Добавляет user в req, если токен валиден.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
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
 * ИСПРАВЛЕНО: теперь работает, т.к. роль добавлена в JWT-пейлоад (auth.service).
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