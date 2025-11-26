import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Logger } from '../../shared';

const logger = new Logger('SocketAuthMiddleware');

export interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn(`Connection attempt without token from ${socket.id}`);
      return next(new Error('Authentication token required'));
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn(`Invalid token from ${socket.id}: ${err.message}`);
        return next(new Error('Invalid or expired token'));
      }

      (socket as AuthenticatedSocket).user = decoded as {
        userId: string;
        email: string;
        role: string;
      };

      logger.log(`User authenticated: ${(socket as AuthenticatedSocket).user?.userId}`);
      next();
    });
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};
