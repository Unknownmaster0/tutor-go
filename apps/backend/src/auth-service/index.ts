import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import {
  errorHandler,
  notFoundHandler,
  Logger,
  ApiResponse,
  connectRedis,
  getCorsConfig,
} from '../shared';
import { AuthService, RedisService, EmailService } from './services';
import { AuthController } from './controllers/auth.controller';
import { createAuthRoutes } from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;
const logger = new Logger('AuthService');

// Initialize services
const prisma = new PrismaClient();
const redisService = new RedisService();
const emailService = new EmailService();
const authService = new AuthService(prisma, redisService, emailService);
const authController = new AuthController(authService);

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  ApiResponse.success(res, {
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth routes
app.use('/auth', createAuthRoutes(authController));

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Initialize Redis connection
const startServer = async () => {
  try {
    await connectRedis();
    logger.log('✅ Redis connected');

    app.listen(PORT, () => {
      logger.log(`🚀 Auth Service is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Auth Service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.log('Shutting down Auth Service...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
