import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler, Logger, ApiResponse, getCorsConfig } from '../shared';
import { prisma } from '../shared/database';
import { PaymentService, RabbitMQService } from './services';
import { PaymentController } from './controllers/payment.controller';
import { createPaymentRoutes } from './routes/payment.routes';

dotenv.config();

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 3004;
const logger = new Logger('PaymentService');

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(compression());
app.use(morgan('dev'));

// Webhook endpoint needs raw body
app.post('/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) =>
  next(),
);

// Regular JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize RabbitMQ service
const rabbitMQService = new RabbitMQService();

// Initialize services
const paymentService = new PaymentService(prisma, rabbitMQService);
const paymentController = new PaymentController(paymentService);

// Routes
app.get('/health', (req, res) => {
  ApiResponse.success(res, {
    service: 'payment-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Payment API Routes
app.use('/payments', createPaymentRoutes(paymentController));

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Try to connect to RabbitMQ but continue if it's unavailable
    try {
      await rabbitMQService.connect();
      logger.log('Connected to RabbitMQ');
    } catch (err) {
      logger.error('Could not connect to RabbitMQ, continuing without it:', err);
    }

    app.listen(PORT, () => {
      logger.log(`🚀 Payment Service is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Payment Service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.log('Shutting down gracefully...');
  await rabbitMQService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.log('Shutting down gracefully...');
  await rabbitMQService.disconnect();
  process.exit(0);
});

startServer();

export default app;
