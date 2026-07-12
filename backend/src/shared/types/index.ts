import { Request } from 'express';

// ========== JWT Payload ==========
export interface JwtPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

// ========== Authenticated Request ==========
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ========== API Response ==========
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========== Pagination ==========
export interface PaginationParams {
  page: number;
  limit: number;
}

// ========== Workout Level ==========
export type WorkoutLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';