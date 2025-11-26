import { Request, Response } from 'express';
import { requireRole, requireStudent, requireTutor, requireAdmin, requireStudentOrTutor } from '../middleware/role.guard';
import { AuthRequest } from '../middleware/auth.middleware';

describe('Role Guards', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should allow access if user has required role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'student@example.com',
        role: 'student',
      };

      const middleware = requireRole('student');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access if user has one of multiple allowed roles', () => {
      mockRequest.user = {
        userId: '123',
        email: 'tutor@example.com',
        role: 'tutor',
      };

      const middleware = requireRole('student', 'tutor');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access if user does not have required role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'student@example.com',
        role: 'student',
      };

      const middleware = requireRole('admin');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
    });

    it('should deny access if user is not authenticated', () => {
      mockRequest.user = undefined;

      const middleware = requireRole('student');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });
  });

  describe('requireStudent', () => {
    it('should allow access for student role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'student@example.com',
        role: 'student',
      };

      requireStudent(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-student roles', () => {
      mockRequest.user = {
        userId: '123',
        email: 'tutor@example.com',
        role: 'tutor',
      };

      requireStudent(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireTutor', () => {
    it('should allow access for tutor role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'tutor@example.com',
        role: 'tutor',
      };

      requireTutor(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-tutor roles', () => {
      mockRequest.user = {
        userId: '123',
        email: 'student@example.com',
        role: 'student',
      };

      requireTutor(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'admin@example.com',
        role: 'admin',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin roles', () => {
      mockRequest.user = {
        userId: '123',
        email: 'student@example.com',
        role: 'student',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireStudentOrTutor', () => {
    it('should allow access for student role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'student@example.com',
        role: 'student',
      };

      requireStudentOrTutor(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for tutor role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'tutor@example.com',
        role: 'tutor',
      };

      requireStudentOrTutor(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for admin role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'admin@example.com',
        role: 'admin',
      };

      requireStudentOrTutor(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });
});
