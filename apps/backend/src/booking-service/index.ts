import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler, Logger, ApiResponse, getCorsConfig } from '../shared';
import { prisma, connectMongoDB } from '../shared/database';
import { BookingService, RabbitMQService } from './services';
import { BookingController } from './controllers/booking.controller';
import { createBookingRoutes } from './routes/booking.routes';

dotenv.config();

const app = express();
const PORT = process.env.BOOKING_SERVICE_PORT || 8003;
const logger = new Logger('BookingService');

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize RabbitMQ service
const rabbitMQService = new RabbitMQService();

// Initialize services
const bookingService = new BookingService(prisma, rabbitMQService);
const bookingController = new BookingController(bookingService);

// Routes
app.get('/health', (req, res) => {
  ApiResponse.success(res, {
    service: 'booking-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Booking API Routes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use('/bookings', createBookingRoutes(bookingController) as any);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB (for tutor availability checks)
    await connectMongoDB();
    logger.log('Connected to MongoDB');

    // Connect to RabbitMQ
    await rabbitMQService.connect();
    logger.log('Connected to RabbitMQ');

    app.listen(PORT, () => {
      logger.log(`🚀 Booking Service is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Booking Service:', error);
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
