import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiResponse } from '../../shared';
import { AuthRequest } from './auth.middleware';

export const requireRole = (...allowedRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        ApiResponse.error(res, 'Insufficient permissions', 403);
        return;
      }

      next();
    } catch (error) {
      ApiResponse.error(res, 'Authorization failed', 500);
    }
  };
};

// Convenience guards for specific roles
export const requireStudent = requireRole('student');
export const requireTutor = requireRole('tutor');
export const requireAdmin = requireRole('admin');
export const requireStudentOrTutor = requireRole('student', 'tutor');
