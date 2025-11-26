import { AuthService } from '../services/auth.service';
import { RedisService } from '../services/redis.service';
import { EmailService } from '../services/email.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock bcrypt and jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService - Password Reset', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockRedisService: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    mockRedisService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      setRefreshToken: jest.fn(),
      getRefreshToken: jest.fn(),
      deleteRefreshToken: jest.fn(),
      setPasswordResetToken: jest.fn(),
      getUserIdByResetToken: jest.fn(),
      deletePasswordResetToken: jest.fn(),
    };

    mockEmailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      sendBookingConfirmationEmail: jest.fn(),
    };

    authService = new AuthService(mockPrisma, mockRedisService, mockEmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    it('should generate reset token and send email for existing user', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        role: 'student',
        phone: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResetToken = 'reset_token_123';

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockResetToken);

      await authService.forgotPassword('test@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockRedisService.setPasswordResetToken).toHaveBeenCalledWith(
        mockUser.id,
        mockResetToken
      );
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        mockResetToken
      );
    });

    it('should not reveal if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authService.forgotPassword('nonexistent@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(mockRedisService.setPasswordResetToken).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should store reset token in Redis with expiration', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        role: 'student',
        phone: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResetToken = 'reset_token_123';

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockResetToken);

      await authService.forgotPassword('test@example.com');

      expect(mockRedisService.setPasswordResetToken).toHaveBeenCalledWith(
        mockUser.id,
        mockResetToken
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const resetToken = 'valid_reset_token';
      const newPassword = 'NewPassword123';
      const hashedPassword = 'new_hashed_password';

      mockRedisService.getUserIdByResetToken.mockResolvedValue(userId);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await authService.resetPassword(resetToken, newPassword);

      expect(mockRedisService.getUserIdByResetToken).toHaveBeenCalledWith(resetToken);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });
      expect(mockRedisService.deletePasswordResetToken).toHaveBeenCalledWith(userId);
    });

    it('should throw error if reset token is invalid', async () => {
      mockRedisService.getUserIdByResetToken.mockResolvedValue(null);

      await expect(authService.resetPassword('invalid_token', 'NewPassword123')).rejects.toThrow(
        'Invalid or expired reset token'
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw error if reset token is expired', async () => {
      mockRedisService.getUserIdByResetToken.mockResolvedValue(null);

      await expect(authService.resetPassword('expired_token', 'NewPassword123')).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should delete reset token after successful password reset', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const resetToken = 'valid_reset_token';

      mockRedisService.getUserIdByResetToken.mockResolvedValue(userId);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      await authService.resetPassword(resetToken, 'NewPassword123');

      expect(mockRedisService.deletePasswordResetToken).toHaveBeenCalledWith(userId);
    });

    it('should hash new password before storing', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const resetToken = 'valid_reset_token';
      const newPassword = 'NewPassword123';

      mockRedisService.getUserIdByResetToken.mockResolvedValue(userId);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      await authService.resetPassword(resetToken, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });
  });
});
