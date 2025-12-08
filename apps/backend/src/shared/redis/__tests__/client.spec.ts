import { RedisClient } from '../client';
import { RedisConfig } from '../types';
import { RedisConnection } from '../connection';

jest.mock('../connection');

describe('RedisClient', () => {
  let client: RedisClient;
  let mockConnection: jest.Mocked<RedisConnection>;
  let mockRedisClient: any;
  let config: RedisConfig;

  beforeEach(() => {
    config = {
      host: 'localhost',
      port: 6379,
      retryAttempts: 3,
      retryDelay: 100,
      keyPrefix: 'test:',
    };

    mockRedisClient = {
      set: jest.fn().mockResolvedValue('OK'),
      setEx: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(0),
      expire: jest.fn().mockResolvedValue(1),
      ttl: jest.fn().mockResolvedValue(-1),
      keys: jest.fn().mockResolvedValue([]),
      hSet: jest.fn().mockResolvedValue(1),
      hGet: jest.fn().mockResolvedValue(null),
      hGetAll: jest.fn().mockResolvedValue({}),
      hDel: jest.fn().mockResolvedValue(1),
    };

    mockConnection = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
      ping: jest.fn().mockResolvedValue('PONG'),
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    } as any;

    (RedisConnection as jest.MockedClass<typeof RedisConnection>).mockImplementation(() => mockConnection);

    client = new RedisClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should connect to Redis', async () => {
      await client.connect();
      expect(mockConnection.connect).toHaveBeenCalled();
    });

    it('should disconnect from Redis', async () => {
      await client.disconnect();
      expect(mockConnection.disconnect).toHaveBeenCalled();
    });

    it('should check connection status', () => {
      expect(client.isConnected()).toBe(true);
      expect(mockConnection.isConnected).toHaveBeenCalled();
    });

    it('should ping Redis', async () => {
      const result = await client.ping();
      expect(result).toBe('PONG');
      expect(mockConnection.ping).toHaveBeenCalled();
    });
  });

  describe('Cache Operations', () => {
    describe('set', () => {
      it('should set a value without TTL', async () => {
        await client.set('key1', { data: 'value' });

        expect(mockRedisClient.set).toHaveBeenCalledWith(
          'test:key1',
          JSON.stringify({ data: 'value' })
        );
      });

      it('should set a value with TTL', async () => {
        await client.set('key1', { data: 'value' }, { ttl: 3600 });

        expect(mockRedisClient.setEx).toHaveBeenCalledWith(
          'test:key1',
          3600,
          JSON.stringify({ data: 'value' })
        );
      });

      it('should use custom prefix', async () => {
        await client.set('key1', { data: 'value' }, { prefix: 'custom:' });

        expect(mockRedisClient.set).toHaveBeenCalledWith(
          'custom:key1',
          JSON.stringify({ data: 'value' })
        );
      });
    });

    describe('get', () => {
      it('should get a value', async () => {
        mockRedisClient.get.mockResolvedValue(JSON.stringify({ data: 'value' }));

        const result = await client.get('key1');

        expect(mockRedisClient.get).toHaveBeenCalledWith('test:key1');
        expect(result).toEqual({ data: 'value' });
      });

      it('should return null for non-existent key', async () => {
        mockRedisClient.get.mockResolvedValue(null);

        const result = await client.get('key1');

        expect(result).toBeNull();
      });

      it('should handle parse errors', async () => {
        mockRedisClient.get.mockResolvedValue('invalid json');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await client.get('key1');

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('del', () => {
      it('should delete a key', async () => {
        await client.del('key1');

        expect(mockRedisClient.del).toHaveBeenCalledWith('test:key1');
      });
    });

    describe('exists', () => {
      it('should return true if key exists', async () => {
        mockRedisClient.exists.mockResolvedValue(1);

        const result = await client.exists('key1');

        expect(result).toBe(true);
        expect(mockRedisClient.exists).toHaveBeenCalledWith('test:key1');
      });

      it('should return false if key does not exist', async () => {
        mockRedisClient.exists.mockResolvedValue(0);

        const result = await client.exists('key1');

        expect(result).toBe(false);
      });
    });

    describe('expire', () => {
      it('should set expiration on a key', async () => {
        await client.expire('key1', 3600);

        expect(mockRedisClient.expire).toHaveBeenCalledWith('test:key1', 3600);
      });
    });

    describe('ttl', () => {
      it('should get TTL of a key', async () => {
        mockRedisClient.ttl.mockResolvedValue(3600);

        const result = await client.ttl('key1');

        expect(result).toBe(3600);
        expect(mockRedisClient.ttl).toHaveBeenCalledWith('test:key1');
      });
    });

    describe('delPattern', () => {
      it('should delete keys matching pattern', async () => {
        mockRedisClient.keys.mockResolvedValue(['test:key1', 'test:key2']);

        const result = await client.delPattern('key*');

        expect(mockRedisClient.keys).toHaveBeenCalledWith('test:key*');
        expect(mockRedisClient.del).toHaveBeenCalledWith(['test:key1', 'test:key2']);
        expect(result).toBe(2);
      });

      it('should return 0 if no keys match', async () => {
        mockRedisClient.keys.mockResolvedValue([]);

        const result = await client.delPattern('key*');

        expect(result).toBe(0);
        expect(mockRedisClient.del).not.toHaveBeenCalled();
      });
    });
  });

  describe('Session Management', () => {
    describe('setSession', () => {
      it('should store a session with default TTL', async () => {
        await client.setSession('token123', { userId: '1', role: 'student' });

        expect(mockRedisClient.setEx).toHaveBeenCalledWith(
          'test:session:token123',
          7 * 24 * 60 * 60,
          JSON.stringify({ userId: '1', role: 'student' })
        );
      });

      it('should store a session with custom TTL', async () => {
        await client.setSession('token123', { userId: '1' }, { ttl: 3600 });

        expect(mockRedisClient.setEx).toHaveBeenCalledWith(
          'test:session:token123',
          3600,
          JSON.stringify({ userId: '1' })
        );
      });
    });

    describe('getSession', () => {
      it('should get a session', async () => {
        mockRedisClient.get.mockResolvedValue(JSON.stringify({ userId: '1' }));

        const result = await client.getSession('token123');

        expect(mockRedisClient.get).toHaveBeenCalledWith('test:session:token123');
        expect(result).toEqual({ userId: '1' });
      });

      it('should return null for non-existent session', async () => {
        mockRedisClient.get.mockResolvedValue(null);

        const result = await client.getSession('token123');

        expect(result).toBeNull();
      });
    });

    describe('deleteSession', () => {
      it('should delete a session', async () => {
        await client.deleteSession('token123');

        expect(mockRedisClient.del).toHaveBeenCalledWith('test:session:token123');
      });
    });

    describe('sessionExists', () => {
      it('should check if session exists', async () => {
        mockRedisClient.exists.mockResolvedValue(1);

        const result = await client.sessionExists('token123');

        expect(result).toBe(true);
        expect(mockRedisClient.exists).toHaveBeenCalledWith('test:session:token123');
      });
    });

    describe('revokeUserSessions', () => {
      it('should revoke all sessions for a user', async () => {
        mockRedisClient.keys.mockResolvedValue(['test:session:token1', 'test:session:token2']);

        const result = await client.revokeUserSessions('user123');

        expect(mockRedisClient.keys).toHaveBeenCalledWith('test:session:*:user123');
        expect(mockRedisClient.del).toHaveBeenCalledWith(['test:session:token1', 'test:session:token2']);
        expect(result).toBe(2);
      });
    });
  });

  describe('Hash Operations', () => {
    describe('hSet', () => {
      it('should set a hash field', async () => {
        await client.hSet('hash1', 'field1', { data: 'value' });

        expect(mockRedisClient.hSet).toHaveBeenCalledWith(
          'test:hash1',
          'field1',
          JSON.stringify({ data: 'value' })
        );
      });

      it('should set a hash field with TTL', async () => {
        await client.hSet('hash1', 'field1', { data: 'value' }, { ttl: 3600 });

        expect(mockRedisClient.hSet).toHaveBeenCalled();
        expect(mockRedisClient.expire).toHaveBeenCalledWith('test:hash1', 3600);
      });
    });

    describe('hGet', () => {
      it('should get a hash field', async () => {
        mockRedisClient.hGet.mockResolvedValue(JSON.stringify({ data: 'value' }));

        const result = await client.hGet('hash1', 'field1');

        expect(mockRedisClient.hGet).toHaveBeenCalledWith('test:hash1', 'field1');
        expect(result).toEqual({ data: 'value' });
      });

      it('should return null for non-existent field', async () => {
        mockRedisClient.hGet.mockResolvedValue(null);

        const result = await client.hGet('hash1', 'field1');

        expect(result).toBeNull();
      });
    });

    describe('hGetAll', () => {
      it('should get all hash fields', async () => {
        mockRedisClient.hGetAll.mockResolvedValue({
          field1: JSON.stringify({ data: 'value1' }),
          field2: JSON.stringify({ data: 'value2' }),
        });

        const result = await client.hGetAll('hash1');

        expect(mockRedisClient.hGetAll).toHaveBeenCalledWith('test:hash1');
        expect(result).toEqual({
          field1: { data: 'value1' },
          field2: { data: 'value2' },
        });
      });
    });

    describe('hDel', () => {
      it('should delete a hash field', async () => {
        await client.hDel('hash1', 'field1');

        expect(mockRedisClient.hDel).toHaveBeenCalledWith('test:hash1', 'field1');
      });
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache by pattern', async () => {
      mockRedisClient.keys.mockResolvedValue(['test:cache:1', 'test:cache:2']);

      const result = await client.invalidateCache('cache:*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('test:cache:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(['test:cache:1', 'test:cache:2']);
      expect(result).toBe(2);
    });
  });
});
