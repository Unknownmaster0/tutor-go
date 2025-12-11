import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { ReviewService, RatingService, RabbitMQService } from './services';
import { ReviewController } from './controllers/review.controller';
import { createReviewRoutes } from './routes/review.routes';
import { RabbitMQConnection } from '../shared/rabbitmq/connection';
import { RabbitMQPublisher } from '../shared/rabbitmq/publisher';
import { getCorsConfig } from '../shared';

dotenv.config();

const app = express();
const PORT = process.env.REVIEW_SERVICE_PORT || 8005;

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize services
let rabbitMQService: RabbitMQService | undefined;
let ratingService: RatingService;
let reviewService: ReviewService;

async function initializeServices() {
  try {
    // Initialize RabbitMQ
    const rabbitMQConnection = new RabbitMQConnection({
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
      exchangeName: process.env.RABBITMQ_EXCHANGE || 'tutorgo_exchange',
      exchangeType: 'topic',
      retryAttempts: 5,
      retryDelay: 5000,
    });

    await rabbitMQConnection.connect();

    const exchangeName = process.env.RABBITMQ_EXCHANGE || 'tutorgo_exchange';
    const rabbitMQPublisher = new RabbitMQPublisher(rabbitMQConnection, exchangeName);
    rabbitMQService = new RabbitMQService(rabbitMQPublisher);

    console.log('✓ RabbitMQ connected');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    console.log('Review service will continue without RabbitMQ');
  }

  // Initialize services
  ratingService = new RatingService(prisma, rabbitMQService);
  reviewService = new ReviewService(prisma, ratingService);

  // Initialize controller
  const reviewController = new ReviewController(reviewService);

  // Routes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use('/reviews', createReviewRoutes(reviewController) as any);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'review-service' });
  });

  // Error handling middleware
  app.use(
    (err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    },
  );
}

// Start server
async function startServer() {
  try {
    await initializeServices();

    app.listen(PORT, () => {
      console.log(`Review Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { app, reviewService, ratingService };
