import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { RegisterDto, AuthResponseDto, RegisterResponseDto } from '../dto';
import { RedisService } from './redis.service';
import { EmailService } from './email.service';

export class AuthService {
  private prisma: PrismaClient;
  private redisService: RedisService;
  private emailService: EmailService;
  private readonly SALT_ROUNDS = 10;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
  private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  constructor(prisma: PrismaClient, redisService: RedisService, emailService: EmailService) {
    this.prisma = prisma;
    this.redisService = redisService;
    this.emailService = emailService;
  }

  async register(data: RegisterDto): Promise<RegisterResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        phone: data.phone,
      },
    });

    // Send verification email (mock for now)
    await this.emailService.sendVerificationEmail(user.email, user.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in Redis
    await this.redisService.setRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      // Check if refresh token exists in Redis
      const storedToken = await this.redisService.getRefreshToken(decoded.userId);

      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = this.generateResetToken();

    // Store reset token in Redis with 1 hour expiration
    await this.redisService.setPasswordResetToken(user.id, resetToken);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user by reset token
    const userId = await this.redisService.getUserIdByResetToken(token);

    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update user password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Delete reset token from Redis
    await this.redisService.deletePasswordResetToken(userId);
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await this.redisService.deleteRefreshToken(userId);
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN }
    );
  }

  private generateResetToken(): string {
    return jwt.sign(
      { purpose: 'password-reset', timestamp: Date.now() },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    const decoded = jwt.verify(token, this.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    return decoded;
  }
}
