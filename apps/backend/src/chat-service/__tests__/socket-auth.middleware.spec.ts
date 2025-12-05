import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { socketAuthMiddleware, AuthenticatedSocket } from '../middleware/socket-auth.middleware';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../shared', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('Socket Auth Middleware', () => {
  let mockSocket: Partial<Socket>;
  let mockNext: jest.Mock;
  const JWT_SECRET = 'test-secret';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    
    mockSocket = {
      id: 'test-socket-id',
      handshake: {
        auth: {},
        headers: {},
      } as any,
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should authenticate socket with valid token in auth object', () => {
    const token = 'valid-token';
    const decoded = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'student',
    };

    mockSocket.handshake!.auth = { token };
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, decoded);
    });

    socketAuthMiddleware(mockSocket as Socket, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET, expect.any(Function));
    expect((mockSocket as AuthenticatedSocket).user).toEqual(decoded);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should authenticate socket with valid token in authorization header', () => {
    const token = 'valid-token';
    const decoded = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'tutor',
    };

    mockSocket.handshake!.headers = { authorization: `Bearer ${token}` };
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, decoded);
    });

    socketAuthMiddleware(mockSocket as Socket, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET, expect.any(Function));
    expect((mockSocket as AuthenticatedSocket).user).toEqual(decoded);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should reject connection without token', () => {
    socketAuthMiddleware(mockSocket as Socket, mockNext);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Authentication token required');
  });

  it('should reject connection with invalid token', () => {
    const token = 'invalid-token';
    const error = new Error('Invalid token');

    mockSocket.handshake!.auth = { token };
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(error, null);
    });

    socketAuthMiddleware(mockSocket as Socket, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET, expect.any(Function));
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Invalid or expired token');
  });

  it('should reject connection with expired token', () => {
    const token = 'expired-token';
    const error = new jwt.TokenExpiredError('jwt expired', new Date());

    mockSocket.handshake!.auth = { token };
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(error, null);
    });

    socketAuthMiddleware(mockSocket as Socket, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Invalid or expired token');
  });

  it('should handle unexpected errors gracefully', () => {
    const token = 'valid-token';
    
    mockSocket.handshake!.auth = { token };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    socketAuthMiddleware(mockSocket as Socket, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Authentication failed');
  });

  it('should use default JWT_SECRET if not provided in environment', () => {
    delete process.env.JWT_SECRET;
    const token = 'valid-token';
    const decoded = { userId: 'user-123', email: 'test@example.com', role: 'student' };

    mockSocket.handshake!.auth = { token };
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, decoded);
    });

    socketAuthMiddleware(mockSocket as Socket, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, 'your-secret-key', expect.any(Function));
  });
});
