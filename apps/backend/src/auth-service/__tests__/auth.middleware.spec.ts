import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and attach user to request', () => {
      const mockToken = 'valid_token';
      const mockDecoded = {
        userId: '123',
        email: 'test@example.com',
        role: 'student',
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect((mockRequest as AuthRequest).user).toEqual(mockDecoded);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', () => {
      mockRequest.headers = {};

      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required',
      });
    });

    it('should reject request with invalid token format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should reject expired token', () => {
      const mockToken = 'expired_token';

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(new Error('Token expired'), null);
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token',
      });
    });

    it('should reject invalid token', () => {
      const mockToken = 'invalid_token';

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should handle Bearer token with correct format', () => {
      const mockToken = 'valid_token_123';
      const mockDecoded = {
        userId: '456',
        email: 'tutor@example.com',
        role: 'tutor',
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

      expect((mockRequest as AuthRequest).user).toEqual(mockDecoded);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
