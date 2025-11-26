import { RedisConnection } from '../connection';
import { RedisConfig } from '../types';
import { createClient } from 'redis';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe('RedisConnection', () => {
  let connection: RedisConnection;
  let mockClient: any;
  let config: RedisConfig;

  beforeEach(() => {
    config = {
      host: 'localhost',
      port: 6379,
      retryAttempts: 3,
      retryDelay: 100,
    };

    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
      ping: jest.fn().mockResolvedValue('PONG'),
      isOpen: true,
      on: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);
    connection = new RedisConnection(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to Redis successfully', async () => {
    await connection.connect();

    expect(createClient).toHaveBeenCalled();
    expect(mockClient.connect).toHaveBeenCalled();
    expect(connection.isConnected()).toBe(true);
  });

  it('should not reconnect if already connected', async () => {
    await connection.connect();
    await connection.connect();

    expect(mockClient.connect).toHaveBeenCalledTimes(1);
  });

  it('should return the client when connected', async () => {
    await connection.connect();
    const client = connection.getClient();

    expect(client).toBe(mockClient);
  });

  it('should throw error when getting client if not connected', () => {
    expect(() => connection.getClient()).toThrow(
      'Redis client not initialized or not connected'
    );
  });

  it('should check connection status', async () => {
    expect(connection.isConnected()).toBe(false);
    
    await connection.connect();
    expect(connection.isConnected()).toBe(true);
  });

  it('should disconnect from Redis', async () => {
    await connection.connect();
    await connection.disconnect();

    expect(mockClient.quit).toHaveBeenCalled();
    expect(connection.isConnected()).toBe(false);
  });

  it('should ping Redis successfully', async () => {
    await connection.connect();
    const result = await connection.ping();

    expect(result).toBe('PONG');
    expect(mockClient.ping).toHaveBeenCalled();
  });

  it('should throw error when pinging if not connected', async () => {
    await expect(connection.ping()).rejects.toThrow(
      'Redis client not initialized or not connected'
    );
  });
});
