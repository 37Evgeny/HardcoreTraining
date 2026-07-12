import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware для валидации входящих данных через Zod.
 * Поддерживает: body, query, params.
 *
 * @example
 * router.post('/workouts', validate(createWorkoutSchema, 'body'), handler);
 */
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data; // заменяем на валидированные данные
      next();
    } catch (error) {
      next(error); // передаем в errorHandler
    }
  };
};