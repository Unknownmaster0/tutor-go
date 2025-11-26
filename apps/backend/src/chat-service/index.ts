import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler, notFoundHandler, Logger, ApiResponse } from '../shared';
import { socketAuthMiddleware } from './middleware/socket-auth.middleware';
import { SocketService } from './services/socket.service';

dotenv.config();

const app = express();
const PORT = process.env.CHAT_SERVICE_PORT || 3006;
const logger = new Logger('ChatService');

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with authentication
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Apply Socket.IO authentication middleware
io.use(socketAuthMiddleware);

// Initialize Socket Service
const socketService = new SocketService(io);
socketService.initialize();

// Initialize Redis connection
socketService.initializeRedis().catch(err => {
  logger.error('Failed to initialize Redis:', err);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  ApiResponse.success(res, {
    service: 'chat-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: socketService.getConnectedUsersCount(),
  });
});

app.get('/chat/health', (req, res) => {
  ApiResponse.success(res, { 
    service: 'Chat Service',
    activeConnections: socketService.getConnectedUsersCount(),
    connectedUsers: socketService.getConnectedUserIds(),
  }, 'Service is healthy');
});

// API Routes
import chatRoutes from './routes/chat.routes';

app.use('/chat', chatRoutes);

// Health check route
app.get('/chat/status', (req, res) => {
  ApiResponse.success(res, { 
    message: 'Chat API is running',
    websocket: 'Socket.IO enabled with JWT authentication',
    activeConnections: socketService.getConnectedUsersCount(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  logger.log(`🚀 Chat Service is running on http://localhost:${PORT}`);
  logger.log(`📡 WebSocket server ready with JWT authentication`);
});

// Export for testing
export { app, io, socketService };
export default app;
