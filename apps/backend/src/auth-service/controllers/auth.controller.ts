import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services';
import { ApiResponse, asyncHandler } from '../../shared';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from '../dto';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("register called")
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const data: RegisterDto = req.body;
      console.log(data);
      const user = await this.authService.register(data);

      ApiResponse.success(res, user, 'User registered successfully', 201);
    } catch (error: any) {
      if (error.message === 'Email already in use') {
        ApiResponse.error(res, error.message, 409);
      } else {
        ApiResponse.error(res, 'Registration failed', 500);
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { email, password }: LoginDto = req.body;
      const authResponse = await this.authService.login(email, password);

      ApiResponse.success(res, authResponse, 'Login successful');
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        ApiResponse.error(res, error.message, 401);
      } else {
        ApiResponse.error(res, 'Login failed', 500);
      }
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { refreshToken }: RefreshTokenDto = req.body;
      const result = await this.authService.refreshAccessToken(refreshToken);

      ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error: any) {
      ApiResponse.error(res, 'Invalid refresh token', 401);
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { email }: ForgotPasswordDto = req.body;
      await this.authService.forgotPassword(email);

      // Always return success to prevent email enumeration
      ApiResponse.success(res, null, 'If the email exists, a password reset link has been sent');
    } catch (error: any) {
      ApiResponse.error(res, 'Failed to process request', 500);
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { token, newPassword }: ResetPasswordDto = req.body;
      await this.authService.resetPassword(token, newPassword);

      ApiResponse.success(res, null, 'Password reset successfully');
    } catch (error: any) {
      if (error.message === 'Invalid or expired reset token') {
        ApiResponse.error(res, error.message, 400);
      } else {
        ApiResponse.error(res, 'Failed to reset password', 500);
      }
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      await this.authService.logout(userId);
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error: any) {
      ApiResponse.error(res, 'Logout failed', 500);
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const user = await this.authService.getUserById(userId);
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error: any) {
      if (error.message === 'User not found') {
        ApiResponse.error(res, 'User not found', 404);
      } else {
        ApiResponse.error(res, 'Failed to retrieve user', 500);
      }
    }
  };
}
