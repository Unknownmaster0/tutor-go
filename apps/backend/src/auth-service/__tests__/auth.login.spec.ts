import { AuthService } from '../services/auth.service';
import { RedisService } from '../services/redis.service';
import { EmailService } from '../services/email.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock bcrypt and jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService - Login and JWT Authentication', () => {
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

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
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

      const mockAccessToken = 'mock_access_token';
      const mockRefreshToken = 'mock_refresh_token';

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await authService.login('test@example.com', 'Password123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', mockUser.passwordHash);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockRedisService.setRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockRefreshToken
      );
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw error if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login('nonexistent@example.com', 'Password123')).rejects.toThrow(
        'Invalid credentials'
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockRedisService.setRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
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

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'WrongPassword')).rejects.toThrow(
        'Invalid credentials'
      );
      expect(mockRedisService.setRefreshToken).not.toHaveBeenCalled();
    });

    it('should store refresh token in Redis with expiration', async () => {
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

      const mockRefreshToken = 'mock_refresh_token';

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock_access_token')
        .mockReturnValueOnce(mockRefreshToken);

      await authService.login('test@example.com', 'Password123');

      expect(mockRedisService.setRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockRefreshToken
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token with valid refresh token', async () => {
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

      const mockRefreshToken = 'valid_refresh_token';
      const mockNewAccessToken = 'new_access_token';

      (jwt.verify as jest.Mock).mockReturnValue({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      mockRedisService.getRefreshToken.mockResolvedValue(mockRefreshToken);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockNewAccessToken);

      const result = await authService.refreshAccessToken(mockRefreshToken);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockRedisService.getRefreshToken).toHaveBeenCalledWith(mockUser.id);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual({ accessToken: mockNewAccessToken });
    });

    it('should throw error if refresh token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshAccessToken('invalid_token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error if refresh token not found in Redis', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: '123',
        email: 'test@example.com',
        role: 'student',
      });
      mockRedisService.getRefreshToken.mockResolvedValue(null);

      await expect(authService.refreshAccessToken('token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error if refresh token does not match stored token', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: '123',
        email: 'test@example.com',
        role: 'student',
      });
      mockRedisService.getRefreshToken.mockResolvedValue('different_token');

      await expect(authService.refreshAccessToken('token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify valid JWT token', async () => {
      const mockDecoded = {
        userId: '123',
        email: 'test@example.com',
        role: 'student',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const result = await authService.verifyToken('valid_token');

      expect(jwt.verify).toHaveBeenCalled();
      expect(result).toEqual(mockDecoded);
    });

    it('should throw error for invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyToken('invalid_token')).rejects.toThrow('Invalid token');
    });
  });

  describe('logout', () => {
    it('should remove refresh token from Redis', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      await authService.logout(userId);

      expect(mockRedisService.deleteRefreshToken).toHaveBeenCalledWith(userId);
    });
  });
});
