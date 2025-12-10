import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler, Logger, ApiResponse, getCorsConfig } from '../shared';
import { NotificationService, RabbitMQConsumerService, SocketService } from './services';
import { NotificationController } from './controllers/notification.controller';
import { createNotificationRoutes } from './routes/notification.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 8007;
const logger = new Logger('NotificationService');

// Initialize Socket.io service
const socketService = new SocketService(httpServer);

// Initialize services
const notificationService = new NotificationService(socketService);
const rabbitMQConsumer = new RabbitMQConsumerService(notificationService);

// Initialize controllers
const notificationController = new NotificationController(notificationService);

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
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
// Cast to `any` to avoid TypeScript overload resolution issues
app.use('/notifications', createNotificationRoutes(notificationController) as any);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Initialize RabbitMQ consumer
async function initializeRabbitMQ() {
  try {
    await rabbitMQConsumer.initialize();
    await rabbitMQConsumer.startConsuming();
    logger.log('✅ RabbitMQ consumer initialized and started');
  } catch (error) {
    logger.error('Failed to initialize RabbitMQ consumer:', error);
    // Don't exit the process, allow the service to run without RabbitMQ
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.log('SIGTERM signal received: closing HTTP server');
  await rabbitMQConsumer.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.log('SIGINT signal received: closing HTTP server');
  await rabbitMQConsumer.shutdown();
  process.exit(0);
});

// Start server
httpServer.listen(PORT, async () => {
  logger.log(`🚀 Notification Service is running on http://localhost:${PORT}`);
  logger.log(`🔌 Socket.io server is ready for real-time notifications`);
  await initializeRabbitMQ();
});

export default app;
