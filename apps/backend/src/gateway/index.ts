import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { errorHandler, notFoundHandler, Logger, ApiResponse, getCorsConfig } from '../shared';

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 8000;
const logger = new Logger('APIGateway');

// Service URLs - All services communicate internally, not exposed to frontend
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
const TUTOR_SERVICE_URL = process.env.TUTOR_SERVICE_URL || 'http://localhost:8002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:8003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8004';
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:8005';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:8006';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8007';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:8008';

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(compression());
app.use(morgan('dev'));
// Remove express.json() and urlencoded from global middleware
// These will be added only for non-proxy routes
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Request logging middleware for debugging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.log(`[${req.method}] ${req.path} - Origin: ${req.get('origin') || 'no origin'}`);
  next();
});

// Handle CORS preflight requests explicitly
app.options('*', cors(getCorsConfig()));

/**
 * AUTH SERVICE ROUTES
 * Port: 8001
 */
app.use(
  '/auth',
  (req: Request, res: Response, next: NextFunction) => {
    // When mounted at /auth, req.path only includes the part after /auth
    // req.originalUrl is the full URL including /auth
    // So for /auth/login: req.path = /login, req.originalUrl = /auth/login
    const fullPath = req.originalUrl.replace(/\?.*/, ''); // Remove query string if any
    logger.log(`[AUTH] Original URL: ${req.originalUrl}`);
    logger.log(`[AUTH] Full path: ${fullPath}`);
    logger.log(`[AUTH] Will forward to: ${AUTH_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[AUTH] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Auth service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

/**
 * TUTOR SERVICE ROUTES
 * Port: 8002
 */
app.use(
  '/tutors',
  (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.originalUrl.replace(/\?.*/, '');
    logger.log(`[TUTOR] Original URL: ${req.originalUrl}`);
    logger.log(`[TUTOR] Full path: ${fullPath}`);
    logger.log(`[TUTOR] Will forward to: ${TUTOR_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: TUTOR_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[TUTOR] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Tutor service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

/**
 * BOOKING SERVICE ROUTES
 * Port: 8003
 */
app.use(
  '/bookings',
  (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.originalUrl.replace(/\?.*/, '');
    logger.log(`[BOOKING] Original URL: ${req.originalUrl}`);
    logger.log(`[BOOKING] Full path: ${fullPath}`);
    logger.log(`[BOOKING] Will forward to: ${BOOKING_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[BOOKING] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Booking service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

/**
 * PAYMENT SERVICE ROUTES
 * Port: 8004
 */
app.use(
  '/payments',
  (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.originalUrl.replace(/\?.*/, '');
    logger.log(`[PAYMENT] Original URL: ${req.originalUrl}`);
    logger.log(`[PAYMENT] Full path: ${fullPath}`);
    logger.log(`[PAYMENT] Will forward to: ${PAYMENT_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[PAYMENT] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Payment service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

/**
 * CHAT SERVICE ROUTES
 * Port: 8006
 */
app.use(
  '/chat',
  (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.originalUrl.replace(/\?.*/, '');
    logger.log(`[CHAT] Original URL: ${req.originalUrl}`);
    logger.log(`[CHAT] Full path: ${fullPath}`);
    logger.log(`[CHAT] Will forward to: ${CHAT_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: CHAT_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[CHAT] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Chat service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

/**
 * REVIEW SERVICE ROUTES
 * Port: 8005
 */
app.use(
  '/reviews',
  (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.originalUrl.replace(/\?.*/, '');
    logger.log(`[REVIEW] Original URL: ${req.originalUrl}`);
    logger.log(`[REVIEW] Full path: ${fullPath}`);
    logger.log(`[REVIEW] Will forward to: ${REVIEW_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: REVIEW_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[REVIEW] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Review service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

/**
 * ADMIN SERVICE ROUTES
 * Port: 8008
 */
app.use(
  '/admin',
  (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.originalUrl.replace(/\?.*/, '');
    logger.log(`[ADMIN] Original URL: ${req.originalUrl}`);
    logger.log(`[ADMIN] Full path: ${fullPath}`);
    logger.log(`[ADMIN] Will forward to: ${ADMIN_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: ADMIN_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[ADMIN] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Admin service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

/**
 * NOTIFICATION SERVICE ROUTES
 * Port: 8007
 */
app.use(
  '/notifications',
  (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.originalUrl.replace(/\?.*/, '');
    logger.log(`[NOTIFICATION] Original URL: ${req.originalUrl}`);
    logger.log(`[NOTIFICATION] Full path: ${fullPath}`);
    logger.log(`[NOTIFICATION] Will forward to: ${NOTIFICATION_SERVICE_URL}${fullPath}`);
    next();
  },
  createProxyMiddleware({
    target: NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    onError: (err: any, req, res) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`[NOTIFICATION] Proxy error: ${errorMsg}`);
      res.status(503).json({
        success: false,
        message: 'Notification service is unavailable',
        error: errorMsg,
      });
    },
  }),
);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
      logger.log(`📚 Routing to services:`);
      logger.log(`   - /auth → ${AUTH_SERVICE_URL}`);
      logger.log(`   - /tutors → ${TUTOR_SERVICE_URL}`);
      logger.log(`   - /bookings → ${BOOKING_SERVICE_URL}`);
      logger.log(`   - /payments → ${PAYMENT_SERVICE_URL}`);
      logger.log(`   - /chat → ${CHAT_SERVICE_URL}`);
      logger.log(`   - /reviews → ${REVIEW_SERVICE_URL}`);
      logger.log(`   - /admin → ${ADMIN_SERVICE_URL}`);
      logger.log(`   - /notifications → ${NOTIFICATION_SERVICE_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
};

startServer();

export default app;
