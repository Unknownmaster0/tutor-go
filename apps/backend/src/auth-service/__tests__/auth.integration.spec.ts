import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService, RedisService, EmailService } from '../services';
import { AuthController } from '../controllers/auth.controller';
import { createAuthRoutes } from '../routes/auth.routes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service - Integration Tests', () => {
  let app: express.Application;
  let mockPrisma: any;
  let mockRedisService: any;
  let mockEmailService: any;
  let authService: AuthService;
  let authController: AuthController;

  beforeAll(() => {
    // Initialize mocks
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

    // Initialize services
    authService = new AuthService(mockPrisma, mockRedisService, mockEmailService);
    authController = new AuthController(authService);

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/auth', createAuthRoutes(authController));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Registration Flow', () => {
    it('should successfully register a new student user', async () => {
      const registrationData = {
        email: 'student@example.com',
        password: 'Password123!',
        name: 'John Student',
        role: 'student',
        phone: '+1234567890',
      };

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: registrationData.email,
        passwordHash: 'hashed_password',
        name: registrationData.name,
        role: registrationData.role,
        phone: registrationData.phone,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .send(registrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(registrationData.email);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registrationData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registrationData.password, 10);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should successfully register a new tutor user', async () => {
      const registrationData = {
        email: 'tutor@example.com',
        password: 'Password123!',
        name: 'Jane Tutor',
        role: 'tutor',
      };

      const mockUser = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        email: registrationData.email,
        passwordHash: 'hashed_password',
        name: registrationData.name,
        role: registrationData.role,
        phone: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .send(registrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('tutor');
    });

    it('should reject registration with existing email', async () => {
      const registrationData = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Existing User',
        role: 'student',
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '123',
        email: registrationData.email,
      });

      const response = await request(app)
        .post('/auth/register')
        .send(registrationData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject registration with invalid email format', async () => {
      const registrationData = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
        role: 'student',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(registrationData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const registrationData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
        role: 'student',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(registrationData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Complete Login Flow', () => {
    it('should successfully login with valid credentials and return JWT tokens', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: loginData.email,
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

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(mockRedisService.setRefreshToken).toHaveBeenCalled();
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(mockRedisService.setRefreshToken).not.toHaveBeenCalled();
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: loginData.email,
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

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(mockRedisService.setRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('Complete Password Reset Flow', () => {
    it('should successfully complete password reset flow', async () => {
      // Step 1: Request password reset
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'old_hashed_password',
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

      const forgotResponse = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(forgotResponse.body.success).toBe(true);
      expect(mockRedisService.setPasswordResetToken).toHaveBeenCalledWith(
        mockUser.id,
        mockResetToken
      );
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();

      // Step 2: Reset password with token
      const newPassword = 'NewPassword123!';
      mockRedisService.getUserIdByResetToken.mockResolvedValue(mockUser.id);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      const resetResponse = await request(app)
        .post('/auth/reset-password')
        .send({
          token: mockResetToken,
          newPassword: newPassword,
        })
        .expect(200);

      expect(resetResponse.body.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { passwordHash: 'new_hashed_password' },
      });
      expect(mockRedisService.deletePasswordResetToken).toHaveBeenCalledWith(mockUser.id);
    });

    it('should not reveal if email does not exist during forgot password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockRedisService.setPasswordResetToken).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should reject password reset with invalid token', async () => {
      mockRedisService.getUserIdByResetToken.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'invalid_token',
          newPassword: 'NewPassword123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should reject password reset with expired token', async () => {
      mockRedisService.getUserIdByResetToken.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'expired_token',
          newPassword: 'NewPassword123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('JWT Token Validation Flow', () => {
    it('should successfully refresh access token with valid refresh token', async () => {
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

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: mockRefreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(mockRedisService.getRefreshToken).toHaveBeenCalledWith(mockUser.id);
    });

    it('should reject refresh with invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject refresh when token not found in Redis', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: '123',
        email: 'test@example.com',
        role: 'student',
      });
      mockRedisService.getRefreshToken.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Complete User Journey - Registration to Login', () => {
    it('should allow user to register and then login', async () => {
      // Step 1: Register
      const registrationData = {
        email: 'journey@example.com',
        password: 'Password123!',
        name: 'Journey User',
        role: 'student',
      };

      const mockUser = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        email: registrationData.email,
        passwordHash: 'hashed_password',
        name: registrationData.name,
        role: registrationData.role,
        phone: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(registrationData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);

      // Step 2: Login with same credentials
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: registrationData.email,
          password: registrationData.password,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('accessToken');
      expect(loginResponse.body.data).toHaveProperty('refreshToken');
    });
  });
});
