import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import * as workoutService from './workout.service';

/**
 * GET /api/workouts
 */
export const getWorkouts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await workoutService.getWorkouts(req.query as any);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workouts/:id
 */
export const getWorkoutById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workout = await workoutService.getWorkoutById(req.params.id);
    res.json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workouts/start
 */
export const startSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await workoutService.startSession(
      req.body,
      req.user!.userId
    );
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/workouts/:sessionId/finish
 */
export const finishSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await workoutService.finishSession(
      req.params.sessionId,
      req.user!.userId
    );
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workouts/history
 */
export const getHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await workoutService.getSessionHistory(
      req.user!.userId,
      page,
      limit
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};