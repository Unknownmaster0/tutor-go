import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../../shared';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      ApiResponse.error(res, 'Access token required', 401);
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        ApiResponse.error(res, 'Invalid or expired token', 403);
        return;
      }

      (req as AuthRequest).user = decoded as {
        userId: string;
        email: string;
        role: string;
      };

      next();
    });
  } catch (error) {
    ApiResponse.error(res, 'Authentication failed', 500);
  }
};
