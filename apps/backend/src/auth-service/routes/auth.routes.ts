import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware';
import { asyncHandler } from '../../shared';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
} from '../validators/auth.validator';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  // Public routes
  router.post('/register', registerValidation, asyncHandler(authController.register));
  router.post('/login', loginValidation, asyncHandler(authController.login));
  router.post('/refresh', refreshTokenValidation, asyncHandler(authController.refreshToken));
  router.post(
    '/forgot-password',
    forgotPasswordValidation,
    asyncHandler(authController.forgotPassword),
  );
  router.post(
    '/reset-password',
    resetPasswordValidation,
    asyncHandler(authController.resetPassword),
  );

  // Protected routes
  router.post('/logout', authenticateToken, asyncHandler(authController.logout));
  router.get('/me', authenticateToken, asyncHandler(authController.me));

  return router;
};
