import { RabbitMQConsumer } from '../consumer';
import { RabbitMQConnection } from '../connection';
import { QueueName, RoutingKey } from '../types';

describe('RabbitMQConsumer', () => {
  let consumer: RabbitMQConsumer;
  let mockConnection: jest.Mocked<RabbitMQConnection>;
  let mockChannel: any;

  beforeEach(() => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue({}),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
      bindQueue: jest.fn().mockResolvedValue({}),
      prefetch: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockResolvedValue({ consumerTag: 'test-tag' }),
      cancel: jest.fn().mockResolvedValue(undefined),
      ack: jest.fn(),
      nack: jest.fn(),
      publish: jest.fn().mockReturnValue(true),
    };

    mockConnection = {
      isConnected: jest.fn().mockReturnValue(true),
      getChannel: jest.fn().mockReturnValue(mockChannel),
    } as any;

    consumer = new RabbitMQConsumer(mockConnection, 'test_exchange');
  });

  describe('setupQueue', () => {
    it('should setup queue with bindings', async () => {
      await consumer.setupQueue(
        QueueName.NOTIFICATION_BOOKING,
        [RoutingKey.BOOKING_CREATED, RoutingKey.BOOKING_CANCELLED]
      );

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        expect.objectContaining({ durable: true })
      );

      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        'test_exchange',
        RoutingKey.BOOKING_CREATED
      );

      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        'test_exchange',
        RoutingKey.BOOKING_CANCELLED
      );
    });

    it('should setup queue with dead letter exchange', async () => {
      await consumer.setupQueue(
        QueueName.NOTIFICATION_BOOKING,
        [RoutingKey.BOOKING_CREATED],
        {
          deadLetterExchange: 'dlx_exchange',
          deadLetterRoutingKey: 'dlx.booking',
        }
      );

      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'dlx_exchange',
        'topic',
        { durable: true }
      );

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        `${QueueName.NOTIFICATION_BOOKING}.dlq`,
        { durable: true }
      );

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        expect.objectContaining({
          durable: true,
          deadLetterExchange: 'dlx_exchange',
          deadLetterRoutingKey: 'dlx.booking',
        })
      );
    });

    it('should setup queue with message TTL', async () => {
      await consumer.setupQueue(
        QueueName.NOTIFICATION_BOOKING,
        [RoutingKey.BOOKING_CREATED],
        {
          messageTtl: 60000,
        }
      );

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        expect.objectContaining({
          durable: true,
          messageTtl: 60000,
        })
      );
    });

    it('should throw error when not connected', async () => {
      mockConnection.isConnected.mockReturnValue(false);

      await expect(
        consumer.setupQueue(QueueName.NOTIFICATION_BOOKING, [RoutingKey.BOOKING_CREATED])
      ).rejects.toThrow('RabbitMQ not connected. Call connect() first.');
    });
  });

  describe('consume', () => {
    it('should start consuming messages', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);

      await consumer.consume(QueueName.NOTIFICATION_BOOKING, handler);

      expect(mockChannel.prefetch).toHaveBeenCalledWith(1);
      expect(mockChannel.consume).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        expect.any(Function),
        { noAck: false }
      );
    });

    it('should process message successfully', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      const message = { bookingId: 'booking-123' };

      let consumeCallback: any;
      mockChannel.consume.mockImplementation((queue: string, callback: any) => {
        consumeCallback = callback;
        return Promise.resolve({ consumerTag: 'test-tag' });
      });

      await consumer.consume(QueueName.NOTIFICATION_BOOKING, handler);

      const mockMsg = {
        content: Buffer.from(JSON.stringify(message)),
        fields: { exchange: 'test_exchange', routingKey: 'booking.created' },
        properties: { headers: {} },
      };

      await consumeCallback(mockMsg);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(handler).toHaveBeenCalledWith(message);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
    });

    it('should retry failed message processing', async () => {
      const handler = jest.fn()
        .mockRejectedValueOnce(new Error('Processing failed'))
        .mockResolvedValueOnce(undefined);

      let consumeCallback: any;
      mockChannel.consume.mockImplementation((queue: string, callback: any) => {
        consumeCallback = callback;
        return Promise.resolve({ consumerTag: 'test-tag' });
      });

      await consumer.consume(QueueName.NOTIFICATION_BOOKING, handler, {
        maxRetries: 3,
        retryDelay: 10,
      });

      const mockMsg = {
        content: Buffer.from(JSON.stringify({ bookingId: 'booking-123' })),
        fields: { exchange: 'test_exchange', routingKey: 'booking.created' },
        properties: { headers: {} },
      };

      await consumeCallback(mockMsg);

      // Wait for retry
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockChannel.publish).toHaveBeenCalled();
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
    });

    it('should send to DLQ after max retries', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Processing failed'));

      let consumeCallback: any;
      mockChannel.consume.mockImplementation((queue: string, callback: any) => {
        consumeCallback = callback;
        return Promise.resolve({ consumerTag: 'test-tag' });
      });

      await consumer.consume(QueueName.NOTIFICATION_BOOKING, handler, {
        maxRetries: 2,
        retryDelay: 10,
      });

      const mockMsg = {
        content: Buffer.from(JSON.stringify({ bookingId: 'booking-123' })),
        fields: { exchange: 'test_exchange', routingKey: 'booking.created' },
        properties: { headers: { 'x-retry-count': 2 } },
      };

      await consumeCallback(mockMsg);

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);
    });

    it('should handle invalid JSON in message', async () => {
      const handler = jest.fn();

      let consumeCallback: any;
      mockChannel.consume.mockImplementation((queue: string, callback: any) => {
        consumeCallback = callback;
        return Promise.resolve({ consumerTag: 'test-tag' });
      });

      await consumer.consume(QueueName.NOTIFICATION_BOOKING, handler);

      const mockMsg = {
        content: Buffer.from('invalid json'),
        fields: { exchange: 'test_exchange', routingKey: 'booking.created' },
        properties: { headers: {} },
      };

      await consumeCallback(mockMsg);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should throw error when not connected', async () => {
      mockConnection.isConnected.mockReturnValue(false);
      const handler = jest.fn();

      await expect(
        consumer.consume(QueueName.NOTIFICATION_BOOKING, handler)
      ).rejects.toThrow('RabbitMQ not connected. Call connect() first.');
    });
  });

  describe('stopConsuming', () => {
    it('should stop consuming from queue', async () => {
      const handler = jest.fn();
      await consumer.consume(QueueName.NOTIFICATION_BOOKING, handler);
      await consumer.stopConsuming(QueueName.NOTIFICATION_BOOKING);

      expect(mockChannel.cancel).toHaveBeenCalledWith('test-tag');
    });

    it('should handle stopping non-existent consumer', async () => {
      await expect(
        consumer.stopConsuming(QueueName.NOTIFICATION_BOOKING)
      ).resolves.not.toThrow();
    });
  });

  describe('stopAll', () => {
    it('should stop all consumers', async () => {
      const handler = jest.fn();
      await consumer.consume(QueueName.NOTIFICATION_BOOKING, handler);
      await consumer.consume(QueueName.NOTIFICATION_PAYMENT, handler);

      await consumer.stopAll();

      expect(mockChannel.cancel).toHaveBeenCalledTimes(2);
    });
  });
});
