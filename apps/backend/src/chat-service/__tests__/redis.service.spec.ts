import { RedisService } from '../services/redis.service';
import { createClient } from 'redis';

// Mock redis
jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

// Mock Logger
jest.mock('../../shared', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('RedisService', () => {
  let redisService: RedisService;
  let mockRedisClient: any;

  beforeEach(() => {
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      rPush: jest.fn().mockResolvedValue(1),
      lRange: jest.fn().mockResolvedValue([]),
      incr: jest.fn().mockResolvedValue(1),
      on: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockRedisClient);

    redisService = new RedisService();
    jest.clearAllMocks();
  });

  describe('connect and disconnect', () => {
    it('should connect to Redis', async () => {
      await redisService.connect();

      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should disconnect from Redis when connected', async () => {
      // Manually set isConnected to true
      (redisService as any).isConnected = true;
      
      await redisService.disconnect();

      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('setUserOnline', () => {
    it('should set user status to online', async () => {
      const userId = 'user-123';
      const socketId = 'socket-456';

      await redisService.setUserOnline(userId, socketId);

      expect(mockRedisClient.set).toHaveBeenCalledWith('user:user-123:status', 'online');
      expect(mockRedisClient.expire).toHaveBeenCalledWith('user:user-123:status', 3600);
      expect(mockRedisClient.set).toHaveBeenCalledWith('user:user-123:socket', socketId);
    });
  });

  describe('setUserOffline', () => {
    it('should set user status to offline', async () => {
      const userId = 'user-123';

      await redisService.setUserOffline(userId);

      expect(mockRedisClient.set).toHaveBeenCalledWith('user:user-123:status', 'offline');
      expect(mockRedisClient.del).toHaveBeenCalledWith('user:user-123:socket');
    });
  });

  describe('isUserOnline', () => {
    it('should return true when user is online', async () => {
      mockRedisClient.get.mockResolvedValue('online');

      const result = await redisService.isUserOnline('user-123');

      expect(result).toBe(true);
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:user-123:status');
    });

    it('should return false when user is offline', async () => {
      mockRedisClient.get.mockResolvedValue('offline');

      const result = await redisService.isUserOnline('user-123');

      expect(result).toBe(false);
    });

    it('should return false when status is not set', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await redisService.isUserOnline('user-123');

      expect(result).toBe(false);
    });
  });


  describe('getUserSocketId', () => {
    it('should return socket ID for user', async () => {
      mockRedisClient.get.mockResolvedValue('socket-456');

      const result = await redisService.getUserSocketId('user-123');

      expect(result).toBe('socket-456');
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:user-123:socket');
    });

    it('should return null when socket ID not found', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await redisService.getUserSocketId('user-123');

      expect(result).toBeNull();
    });
  });

  describe('queueMessageForOfflineUser', () => {
    it('should queue message for offline user', async () => {
      const userId = 'user-123';
      const message = { id: 'msg-1', text: 'Hello' };

      await redisService.queueMessageForOfflineUser(userId, message);

      expect(mockRedisClient.rPush).toHaveBeenCalledWith(
        'user:user-123:offline_messages',
        JSON.stringify(message)
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith('user:user-123:offline_messages', 604800);
    });
  });

  describe('getQueuedMessages', () => {
    it('should retrieve and clear queued messages', async () => {
      const userId = 'user-123';
      const messages = [
        JSON.stringify({ id: 'msg-1', text: 'Hello' }),
        JSON.stringify({ id: 'msg-2', text: 'Hi' }),
      ];

      mockRedisClient.lRange.mockResolvedValue(messages);

      const result = await redisService.getQueuedMessages(userId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'msg-1', text: 'Hello' });
      expect(mockRedisClient.lRange).toHaveBeenCalledWith('user:user-123:offline_messages', 0, -1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('user:user-123:offline_messages');
    });

    it('should return empty array when no messages queued', async () => {
      mockRedisClient.lRange.mockResolvedValue([]);

      const result = await redisService.getQueuedMessages('user-123');

      expect(result).toEqual([]);
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
  });

  describe('incrementUnreadCount', () => {
    it('should increment unread message count', async () => {
      const userId = 'user-123';

      await redisService.incrementUnreadCount(userId);

      expect(mockRedisClient.incr).toHaveBeenCalledWith('user:user-123:unread_count');
      expect(mockRedisClient.expire).toHaveBeenCalledWith('user:user-123:unread_count', 604800);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      mockRedisClient.get.mockResolvedValue('5');

      const result = await redisService.getUnreadCount('user-123');

      expect(result).toBe(5);
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:user-123:unread_count');
    });

    it('should return 0 when no unread count set', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await redisService.getUnreadCount('user-123');

      expect(result).toBe(0);
    });
  });

  describe('resetUnreadCount', () => {
    it('should reset unread message count', async () => {
      const userId = 'user-123';

      await redisService.resetUnreadCount(userId);

      expect(mockRedisClient.del).toHaveBeenCalledWith('user:user-123:unread_count');
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully in setUserOnline', async () => {
      mockRedisClient.set.mockRejectedValue(new Error('Redis error'));

      await expect(redisService.setUserOnline('user-123', 'socket-456')).resolves.not.toThrow();
    });

    it('should handle errors gracefully in isUserOnline', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await redisService.isUserOnline('user-123');

      expect(result).toBe(false);
    });

    it('should handle errors gracefully in getQueuedMessages', async () => {
      mockRedisClient.lRange.mockRejectedValue(new Error('Redis error'));

      const result = await redisService.getQueuedMessages('user-123');

      expect(result).toEqual([]);
    });
  });
});
