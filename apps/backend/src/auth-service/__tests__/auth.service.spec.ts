import { AuthService } from '../services/auth.service';
import { RedisService } from '../services/redis.service';
import { EmailService } from '../services/email.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService - Registration', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockRedisService: any;
  let mockEmailService: any;

  beforeEach(() => {
    // Create mock instances
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

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        role: 'student' as const,
      };

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: registerData.email,
        passwordHash: 'hashed_password',
        name: registerData.name,
        role: registerData.role,
        phone: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await authService.register(registerData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          passwordHash: 'hashed_password',
          name: registerData.name,
          role: registerData.role,
          phone: undefined,
        },
      });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
        role: 'student' as const,
      };

      const existingUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: registerData.email,
        passwordHash: 'hashed_password',
        name: 'Existing User',
        role: 'student',
        phone: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser as any);

      await expect(authService.register(registerData)).rejects.toThrow('Email already in use');
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should register a tutor with phone number', async () => {
      const registerData = {
        email: 'tutor@example.com',
        password: 'Password123',
        name: 'Tutor User',
        role: 'tutor' as const,
        phone: '+1234567890',
      };

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: registerData.email,
        passwordHash: 'hashed_password',
        name: registerData.name,
        role: registerData.role,
        phone: registerData.phone,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await authService.register(registerData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          passwordHash: 'hashed_password',
          name: registerData.name,
          role: registerData.role,
          phone: registerData.phone,
        },
      });
      expect(result.id).toBe(mockUser.id);
    });

    it('should hash password with correct salt rounds', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        role: 'student' as const,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '123',
        email: registerData.email,
        passwordHash: 'hashed_password',
        name: registerData.name,
        role: registerData.role,
        phone: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      await authService.register(registerData);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
    });
  });
});
