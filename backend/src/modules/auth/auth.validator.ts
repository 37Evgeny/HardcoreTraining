import { z } from 'zod';

/**
 * Валидация регистрации.
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email too long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    name: z.string().min(2, 'Name too short').max(100, 'Name too long').optional(),
  })
  .strict();

/**
 * Валидация логина.
 */
export const loginSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

/**
 * Валидация refresh token.
 */
export const refreshSchema = z
  .object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;