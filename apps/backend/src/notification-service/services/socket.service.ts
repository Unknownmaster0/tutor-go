import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

/**
 * Socket.io Service for real-time notifications
 */
export class SocketService {
  private io: Server;
  private userSockets: Map<string, string[]>; // userId -> socketIds[]

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.userSockets = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
          userId: string;
        };

        // Attach user info to socket
        socket.data.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      console.log(`User ${userId} connected with socket ${socket.id}`);

      // Track user socket connections
      this.addUserSocket(userId, socket.id);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected from socket ${socket.id}`);
        this.removeUserSocket(userId, socket.id);
      });

      // Send connection confirmation
      socket.emit('connected', { userId, socketId: socket.id });
    });
  }

  /**
   * Add user socket to tracking map
   */
  private addUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(socketId);
    this.userSockets.set(userId, sockets);
  }

  /**
   * Remove user socket from tracking map
   */
  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId) || [];
    const filtered = sockets.filter((id) => id !== socketId);

    if (filtered.length === 0) {
      this.userSockets.delete(userId);
    } else {
      this.userSockets.set(userId, filtered);
    }
  }

  /**
   * Send notification to a specific user
   */
  sendNotificationToUser(userId: string, notification: any): void {
    const socketIds = this.userSockets.get(userId);

    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        this.io.to(socketId).emit('notification', notification);
      });
      console.log(`Notification sent to user ${userId} on ${socketIds.length} socket(s)`);
    } else {
      console.log(`User ${userId} is not connected, notification will be stored in database`);
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets !== undefined && sockets.length > 0;
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get Socket.io server instance
   */
  getIO(): Server {
    return this.io;
  }
}
