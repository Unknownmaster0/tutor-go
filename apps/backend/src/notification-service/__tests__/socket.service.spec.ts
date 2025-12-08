import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SocketService } from '../services/socket.service';
import jwt from 'jsonwebtoken';

// Mock socket.io
jest.mock('socket.io');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('SocketService', () => {
  let socketService: SocketService;
  let mockHttpServer: HTTPServer;
  let mockIO: jest.Mocked<Server>;
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    mockHttpServer = {} as HTTPServer;
    mockSocket = {
      id: 'socket-123',
      data: {},
      handshake: {
        auth: {
          token: 'valid-token',
        },
      },
      emit: jest.fn(),
      on: jest.fn(),
    } as any;

    mockIO = {
      use: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    (Server as jest.MockedClass<typeof Server>).mockImplementation(() => mockIO);

    socketService = new SocketService(mockHttpServer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize Socket.io server with CORS configuration', () => {
      expect(Server).toHaveBeenCalledWith(
        mockHttpServer,
        expect.objectContaining({
          cors: expect.objectContaining({
            origin: expect.any(String),
            credentials: true,
          }),
        })
      );
    });

    it('should setup authentication middleware', () => {
      expect(mockIO.use).toHaveBeenCalled();
    });

    it('should setup event handlers', () => {
      expect(mockIO.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('authentication middleware', () => {
    let authMiddleware: any;

    beforeEach(() => {
      authMiddleware = (mockIO.use as jest.Mock).mock.calls[0][0];
    });

    it('should authenticate valid token', () => {
      const next = jest.fn();
      const socket: any = {
        handshake: {
          auth: {
            token: 'valid-token',
          },
        },
        data: {},
      };

      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123' });

      authMiddleware(socket, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(socket.data.userId).toBe('user-123');
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject connection without token', () => {
      const next = jest.fn();
      const socket: any = {
        handshake: {
          auth: {},
        },
        data: {},
      };

      authMiddleware(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toContain('No token provided');
    });

    it('should reject connection with invalid token', () => {
      const next = jest.fn();
      const socket: any = {
        handshake: {
          auth: {
            token: 'invalid-token',
          },
        },
        data: {},
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toContain('Invalid token');
    });
  });

  describe('connection handling', () => {
    let connectionHandler: any;

    beforeEach(() => {
      connectionHandler = (mockIO.on as jest.Mock).mock.calls[0][1];
      mockSocket.data.userId = 'user-123';
    });

    it('should handle user connection', () => {
      connectionHandler(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        userId: 'user-123',
        socketId: 'socket-123',
      });
    });

    it('should track user socket connection', () => {
      connectionHandler(mockSocket);

      expect(socketService.isUserOnline('user-123')).toBe(true);
    });

    it('should handle user disconnection', () => {
      connectionHandler(mockSocket);

      // Get the disconnect handler
      const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        (call) => call[0] === 'disconnect'
      )[1];

      disconnectHandler();

      expect(socketService.isUserOnline('user-123')).toBe(false);
    });

    it('should track multiple socket connections for same user', () => {
      const mockSocket2 = {
        ...mockSocket,
        id: 'socket-456',
        data: { userId: 'user-123' },
      };

      connectionHandler(mockSocket);
      connectionHandler(mockSocket2);

      expect(socketService.isUserOnline('user-123')).toBe(true);
    });
  });

  describe('sendNotificationToUser', () => {
    let connectionHandler: any;

    beforeEach(() => {
      connectionHandler = (mockIO.on as jest.Mock).mock.calls[0][1];
      mockSocket.data.userId = 'user-123';
    });

    it('should send notification to online user', () => {
      connectionHandler(mockSocket);

      const notification = {
        id: 'notif-1',
        title: 'Test Notification',
        message: 'Test message',
      };

      socketService.sendNotificationToUser('user-123', notification);

      expect(mockIO.to).toHaveBeenCalledWith('socket-123');
      expect(mockIO.emit).toHaveBeenCalledWith('notification', notification);
    });

    it('should handle notification for offline user', () => {
      const notification = {
        id: 'notif-1',
        title: 'Test Notification',
        message: 'Test message',
      };

      // User is not connected
      socketService.sendNotificationToUser('user-456', notification);

      // Should not throw error, just log
      expect(mockIO.to).not.toHaveBeenCalled();
    });

    it('should send notification to all user sockets', () => {
      const mockSocket2 = {
        ...mockSocket,
        id: 'socket-456',
        data: { userId: 'user-123' },
        on: jest.fn(),
        emit: jest.fn(),
      };

      connectionHandler(mockSocket);
      connectionHandler(mockSocket2);

      const notification = {
        id: 'notif-1',
        title: 'Test Notification',
        message: 'Test message',
      };

      socketService.sendNotificationToUser('user-123', notification);

      expect(mockIO.to).toHaveBeenCalledWith('socket-123');
      expect(mockIO.to).toHaveBeenCalledWith('socket-456');
      expect(mockIO.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('isUserOnline', () => {
    let connectionHandler: any;

    beforeEach(() => {
      connectionHandler = (mockIO.on as jest.Mock).mock.calls[0][1];
      mockSocket.data.userId = 'user-123';
    });

    it('should return true for online user', () => {
      connectionHandler(mockSocket);

      expect(socketService.isUserOnline('user-123')).toBe(true);
    });

    it('should return false for offline user', () => {
      expect(socketService.isUserOnline('user-456')).toBe(false);
    });

    it('should return false after user disconnects', () => {
      connectionHandler(mockSocket);

      const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        (call) => call[0] === 'disconnect'
      )[1];

      disconnectHandler();

      expect(socketService.isUserOnline('user-123')).toBe(false);
    });
  });

  describe('getOnlineUsersCount', () => {
    let connectionHandler: any;

    beforeEach(() => {
      connectionHandler = (mockIO.on as jest.Mock).mock.calls[0][1];
    });

    it('should return 0 when no users are online', () => {
      expect(socketService.getOnlineUsersCount()).toBe(0);
    });

    it('should return correct count of online users', () => {
      mockSocket.data.userId = 'user-123';
      connectionHandler(mockSocket);

      const mockSocket2 = {
        ...mockSocket,
        id: 'socket-456',
        data: { userId: 'user-456' },
        on: jest.fn(),
        emit: jest.fn(),
      };
      connectionHandler(mockSocket2);

      expect(socketService.getOnlineUsersCount()).toBe(2);
    });

    it('should not count same user multiple times', () => {
      mockSocket.data.userId = 'user-123';
      connectionHandler(mockSocket);

      const mockSocket2 = {
        ...mockSocket,
        id: 'socket-456',
        data: { userId: 'user-123' },
        on: jest.fn(),
        emit: jest.fn(),
      };
      connectionHandler(mockSocket2);

      expect(socketService.getOnlineUsersCount()).toBe(1);
    });
  });

  describe('getIO', () => {
    it('should return Socket.io server instance', () => {
      const io = socketService.getIO();

      expect(io).toBe(mockIO);
    });
  });
});
