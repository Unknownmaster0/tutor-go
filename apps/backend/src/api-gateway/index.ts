import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import httpProxy from 'express-http-proxy';
import dotenv from 'dotenv';
import { Logger, getCorsConfig } from '../shared';

dotenv.config();

const app = express();
const GATEWAY_PORT = process.env.GATEWAY_PORT || 3001;
const logger = new Logger('APIGateway');

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3008';
const TUTOR_SERVICE_URL = process.env.TUTOR_SERVICE_URL || 'http://localhost:3002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3006';
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:3005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3009';

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Service Routes with Proxying
// Auth Service
app.use(
  '/auth',
  httpProxy(AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Auth Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Auth Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Tutor Service
app.use(
  '/tutors',
  httpProxy(TUTOR_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Tutor Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Tutor Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Booking Service
app.use(
  '/bookings',
  httpProxy(BOOKING_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Booking Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Booking Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Payment Service
app.use(
  '/payments',
  httpProxy(PAYMENT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Payment Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Payment Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Chat Service
app.use(
  '/chat',
  httpProxy(CHAT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Chat Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Chat Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Messages endpoint (also routes to Chat Service)
app.use(
  '/messages',
  httpProxy(CHAT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Chat Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Chat Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Review Service
app.use(
  '/reviews',
  httpProxy(REVIEW_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Review Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Review Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Notification Service
app.use(
  '/notifications',
  httpProxy(NOTIFICATION_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Notification Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Notification Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// Admin Service
app.use(
  '/admin',
  httpProxy(ADMIN_SERVICE_URL, {
    proxyReqPathResolver: (req) => `${req.baseUrl}${req.url || ''}`,
    logLevel: 'warn',
    onError: (err, req, res) => {
      logger.error('Admin Service Error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Admin Service is currently unavailable',
        error: err.message,
      });
    },
  }),
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Gateway Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Start Gateway
const startGateway = async () => {
  try {
    app.listen(GATEWAY_PORT, () => {
      logger.log(`🚀 API Gateway is running on http://localhost:${GATEWAY_PORT}`);
      logger.log(`📍 Auth Service: ${AUTH_SERVICE_URL}`);
      logger.log(`📍 Tutor Service: ${TUTOR_SERVICE_URL}`);
      logger.log(`📍 Booking Service: ${BOOKING_SERVICE_URL}`);
      logger.log(`📍 Payment Service: ${PAYMENT_SERVICE_URL}`);
      logger.log(`📍 Chat Service: ${CHAT_SERVICE_URL}`);
      logger.log(`📍 Review Service: ${REVIEW_SERVICE_URL}`);
      logger.log(`📍 Notification Service: ${NOTIFICATION_SERVICE_URL}`);
      logger.log(`📍 Admin Service: ${ADMIN_SERVICE_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
};

startGateway();

export default app;
