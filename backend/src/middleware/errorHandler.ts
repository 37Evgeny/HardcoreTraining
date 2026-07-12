import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../shared/types';

/**
 * Кастомный класс ошибки с HTTP статусом.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Централизованный обработчик ошибок.
 * Обрабатывает: AppError, ZodError, PrismaError, и неизвестные ошибки.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  // 1. Наша кастомная ошибка
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // 2. Ошибка валидации Zod
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      message: 'Validation error',
      data: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
    res.status(400).json(response);
    return;
  }

  // 3. Ошибка Prisma (уникальность, not found и т.д.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const response: ApiResponse = {
        success: false,
        message: 'Resource already exists',
      };
      res.status(409).json(response);
      return;
    }
    if (err.code === 'P2025') {
      const response: ApiResponse = {
        success: false,
        message: 'Resource not found',
      };
      res.status(404).json(response);
      return;
    }
  }

  // 4. Неизвестная ошибка
  const response: ApiResponse = {
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal Server Error',
  };
  res.status(500).json(response);
};