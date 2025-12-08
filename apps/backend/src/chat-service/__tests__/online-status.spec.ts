import { Server, Socket } from 'socket.io';
import { SocketService } from '../services/socket.service';
import { RedisService } from '../services/redis.service';
import { AuthenticatedSocket } from '../middleware/socket-auth.middleware';

// Mock dependencies
jest.mock('../../shared', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
  prisma: {
    booking: {
      findFirst: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../services/message.service');
jest.mock('../services/redis.service');

describe('SocketService - Online/Offline Status', () => {
  let mockIo: any;
  let socketService: SocketService;
  let mockSocket: Partial<AuthenticatedSocket>;
  let connectionHandler: (socket: Socket) => void;
  let mockRedisService: jest.Mocked<RedisService>;

  beforeEach(() => {
    // Mock Socket.IO server
    mockIo = {
      on: jest.fn((event: string, handler: any) => {
        if (event === 'connection') {
          connectionHandler = handler;
        }
        return mockIo;
      }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    socketService = new SocketService(mockIo as Server);

    // Mock authenticated socket
    mockSocket = {
      id: 'socket-123',
      user: {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'student',
      },
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      disconnect: jest.fn(),
      broadcast: {
        emit: jest.fn(),
      } as any,
    };

    // Get the mocked RedisService instance
    mockRedisService = (socketService as any).redisService as jest.Mocked<RedisService>;
  });

  describe('user connection with online status', () => {
    beforeEach(() => {
      socketService.initialize();
      mockRedisService.setUserOnline.mockResolvedValue();
      mockRedisService.getQueuedMessages.mockResolvedValue([]);
      mockRedisService.getUnreadCount.mockResolvedValue(0);
    });

    it('should set user as online when connecting', async () => {
      await connectionHandler(mockSocket as Socket);

      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(mockRedisService.setUserOnline).toHaveBeenCalledWith('user-123', 'socket-123');
    });

    it('should broadcast online status to other users', async () => {
      await connectionHandler(mockSocket as Socket);

      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(mockSocket.broadcast?.emit).toHaveBeenCalledWith('user-online', { userId: 'user-123' });
    });

    it('should deliver queued messages on connection', async () => {
      const queuedMessages = [
        { id: 'msg-1', message: 'Hello' },
        { id: 'msg-2', message: 'Hi there' },
      ];

      mockRedisService.getQueuedMessages.mockResolvedValue(queuedMessages);
      mockRedisService.getUnreadCount.mockResolvedValue(5);

      await connectionHandler(mockSocket as Socket);

      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(mockRedisService.getQueuedMessages).toHaveBeenCalledWith('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', expect.objectContaining({
        userId: 'user-123',
        queuedMessages,
        unreadCount: 5,
      }));
    });
  });

  describe('user disconnection with offline status', () => {
    beforeEach(async () => {
      socketService.initialize();
      mockRedisService.setUserOnline.mockResolvedValue();
      mockRedisService.getQueuedMessages.mockResolvedValue([]);
      mockRedisService.getUnreadCount.mockResolvedValue(0);
      await connectionHandler(mockSocket as Socket);
    });

    it('should set user as offline when disconnecting', async () => {
      mockRedisService.setUserOffline.mockResolvedValue();

      // Get the disconnect handler
      const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'disconnect'
      )[1];

      await disconnectHandler();

      expect(mockRedisService.setUserOffline).toHaveBeenCalledWith('user-123');
    });

    it('should broadcast offline status to other users', async () => {
      mockRedisService.setUserOffline.mockResolvedValue();

      const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'disconnect'
      )[1];

      await disconnectHandler();

      expect(mockSocket.broadcast?.emit).toHaveBeenCalledWith('user-offline', { userId: 'user-123' });
    });
  });

  describe('getUserOnlineStatus', () => {
    it('should check user online status from Redis', async () => {
      mockRedisService.isUserOnline.mockResolvedValue(true);

      const result = await socketService.getUserOnlineStatus('user-123');

      expect(result).toBe(true);
      expect(mockRedisService.isUserOnline).toHaveBeenCalledWith('user-123');
    });

    it('should return false for offline users', async () => {
      mockRedisService.isUserOnline.mockResolvedValue(false);

      const result = await socketService.getUserOnlineStatus('user-456');

      expect(result).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should disconnect Redis on cleanup', async () => {
      mockRedisService.disconnect.mockResolvedValue();

      await socketService.cleanup();

      expect(mockRedisService.disconnect).toHaveBeenCalled();
    });
  });
});
