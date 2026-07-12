import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import * as authController from './auth.controller';
import { loginSchema, refreshSchema, registerSchema } from './auth.validator';

const router = Router();

/**
 * POST /api/auth/register
 * Регистрация нового пользователя.
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Вход в систему.
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * POST /api/auth/refresh
 * Обновление access token.
 */
router.post('/refresh', validate(refreshSchema), authController.refresh);

export default router;