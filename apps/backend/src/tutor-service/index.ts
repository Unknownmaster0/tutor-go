import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import {
  errorHandler,
  notFoundHandler,
  Logger,
  ApiResponse,
  connectMongoDB,
  connectRedis,
  getCorsConfig,
} from '../shared';
import { TutorService, GeocodingService, RedisService, CloudinaryService } from './services';
import { TutorController } from './controllers/tutor.controller';
import { createTutorRoutes } from './routes/tutor.routes';

dotenv.config();

const app = express();
const PORT = process.env.TUTOR_SERVICE_PORT || 8002;
const logger = new Logger('TutorService');

// Initialize services
const geocodingService = new GeocodingService();
const cloudinaryService = new CloudinaryService();
const redisService = new RedisService();
const tutorService = new TutorService(geocodingService, cloudinaryService);
const tutorController = new TutorController(tutorService, redisService);

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
    service: 'tutor-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use('/tutors', createTutorRoutes(tutorController) as any);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Initialize connections and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Connect to Redis
    await connectRedis();

    // Start server
    app.listen(PORT, () => {
      logger.log(`🚀 Tutor Service is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
