import { RabbitMQConnection } from '../connection';
import { RabbitMQConfig } from '../types';
import * as amqp from 'amqplib';

// Mock amqplib
jest.mock('amqplib');

describe('RabbitMQConnection', () => {
  let connection: RabbitMQConnection;
  let mockConnection: any;
  let mockChannel: any;
  let config: RabbitMQConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock connection and channel
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue({}),
      close: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockReturnValue(true),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    config = {
      url: 'amqp://localhost:5672',
      exchangeName: 'test_exchange',
      exchangeType: 'topic',
      retryAttempts: 3,
      retryDelay: 100,
    };

    connection = new RabbitMQConnection(config);
  });

  afterEach(async () => {
    if (connection.isConnected()) {
      await connection.disconnect();
    }
  });

  describe('connect', () => {
    it('should connect to RabbitMQ successfully', async () => {
      await connection.connect();

      expect(amqp.connect).toHaveBeenCalledWith(config.url);
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        config.exchangeName,
        config.exchangeType,
        { durable: true }
      );
      expect(connection.isConnected()).toBe(true);
    });

    it('should not connect if already connected', async () => {
      await connection.connect();
      const firstCallCount = (amqp.connect as jest.Mock).mock.calls.length;

      await connection.connect();
      const secondCallCount = (amqp.connect as jest.Mock).mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should retry connection on failure', async () => {
      (amqp.connect as jest.Mock)
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(mockConnection);

      await connection.connect();

      expect(amqp.connect).toHaveBeenCalledTimes(2);
      expect(connection.isConnected()).toBe(true);
    });

    it('should throw error after max retry attempts', async () => {
      (amqp.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(connection.connect()).rejects.toThrow(
        `Failed to connect to RabbitMQ after ${config.retryAttempts} attempts`
      );

      expect(amqp.connect).toHaveBeenCalledTimes(config.retryAttempts);
    });

    it('should set up error handlers on connection', async () => {
      await connection.connect();

      expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('getChannel', () => {
    it('should return channel when connected', async () => {
      await connection.connect();
      const channel = connection.getChannel();

      expect(channel).toBe(mockChannel);
    });

    it('should throw error when not connected', () => {
      expect(() => connection.getChannel()).toThrow(
        'RabbitMQ channel not initialized. Call connect() first.'
      );
    });
  });

  describe('getConnection', () => {
    it('should return connection when connected', async () => {
      await connection.connect();
      const conn = connection.getConnection();

      expect(conn).toBe(mockConnection);
    });

    it('should throw error when not connected', () => {
      expect(() => connection.getConnection()).toThrow(
        'RabbitMQ connection not initialized. Call connect() first.'
      );
    });
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      expect(connection.isConnected()).toBe(false);
    });

    it('should return true when connected', async () => {
      await connection.connect();
      expect(connection.isConnected()).toBe(true);
    });

    it('should return false after disconnect', async () => {
      await connection.connect();
      await connection.disconnect();
      expect(connection.isConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await connection.connect();
      await connection.disconnect();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
      expect(connection.isConnected()).toBe(false);
    });

    it('should handle disconnect when not connected', async () => {
      await expect(connection.disconnect()).resolves.not.toThrow();
    });

    it('should throw error if disconnect fails', async () => {
      // Create a new mock that will fail on close
      const failingMockChannel = {
        assertExchange: jest.fn().mockResolvedValue({}),
        close: jest.fn().mockRejectedValue(new Error('Close failed')),
      };

      const failingMockConnection = {
        createChannel: jest.fn().mockResolvedValue(failingMockChannel),
        close: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
      };

      (amqp.connect as jest.Mock).mockResolvedValueOnce(failingMockConnection);

      const failingConnection = new RabbitMQConnection(config);
      await failingConnection.connect();

      await expect(failingConnection.disconnect()).rejects.toThrow('Close failed');
    });
  });

  describe('connection error handling', () => {
    it('should handle connection errors', async () => {
      await connection.connect();

      // Simulate connection error
      const errorHandler = mockConnection.on.mock.calls.find(
        (call: any) => call[0] === 'error'
      )?.[1];

      expect(errorHandler).toBeDefined();
      
      // Trigger error handler
      if (errorHandler) {
        errorHandler(new Error('Connection error'));
      }

      // Connection should be marked as disconnected
      expect(connection.isConnected()).toBe(false);
    });

    it('should handle connection close', async () => {
      await connection.connect();

      // Simulate connection close
      const closeHandler = mockConnection.on.mock.calls.find(
        (call: any) => call[0] === 'close'
      )?.[1];

      expect(closeHandler).toBeDefined();
      
      // Trigger close handler
      if (closeHandler) {
        closeHandler();
      }

      // Connection should be marked as disconnected
      expect(connection.isConnected()).toBe(false);
    });
  });
});
