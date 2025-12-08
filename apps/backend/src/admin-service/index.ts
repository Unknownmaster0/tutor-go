import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler, Logger, ApiResponse, getCorsConfig } from '../shared';
import { prisma } from '../shared/database';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { createAdminRoutes } from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.ADMIN_SERVICE_PORT || 3007;
const logger = new Logger('AdminService');

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const adminService = new AdminService(prisma);
const adminController = new AdminController(adminService);

// Routes
app.get('/health', (req, res) => {
  ApiResponse.success(res, {
    service: 'admin-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Admin API Routes
app.use('/admin', createAdminRoutes(adminController));

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.log(`🚀 Admin Service is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Admin Service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
