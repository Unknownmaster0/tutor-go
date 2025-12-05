import { RabbitMQConsumerService } from '../services/rabbitmq-consumer.service';
import { NotificationService } from '../services/notification.service';
import {
  createRabbitMQConnection,
  createConsumer,
  QueueName,
  RoutingKey,
  BookingCreatedEvent,
  BookingCancelledEvent,
  PaymentCompletedEvent,
  ReviewSubmittedEvent,
} from '../../shared/rabbitmq';

// Mock the shared RabbitMQ module
jest.mock('../../shared/rabbitmq', () => ({
  ...jest.requireActual('../../shared/rabbitmq'),
  createRabbitMQConnection: jest.fn(),
  createConsumer: jest.fn(),
}));

describe('Notification Service - RabbitMQConsumerService', () => {
  let service: RabbitMQConsumerService;
  let mockConnection: any;
  let mockConsumer: any;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    mockConnection = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
    };

    mockConsumer = {
      setupQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockResolvedValue(undefined),
      stopAll: jest.fn().mockResolvedValue(undefined),
    };

    mockNotificationService = {
      handleBookingCreated: jest.fn().mockResolvedValue(undefined),
      handleBookingCancelled: jest.fn().mockResolvedValue(undefined),
      handlePaymentCompleted: jest.fn().mockResolvedValue(undefined),
      handleReviewSubmitted: jest.fn().mockResolvedValue(undefined),
    } as any;

    (createRabbitMQConnection as jest.Mock).mockReturnValue(mockConnection);
    (createConsumer as jest.Mock).mockReturnValue(mockConsumer);

    service = new RabbitMQConsumerService(mockNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should connect to RabbitMQ and setup queues', async () => {
      await service.initialize();

      expect(mockConnection.connect).toHaveBeenCalled();
      expect(mockConsumer.setupQueue).toHaveBeenCalledTimes(3);

      // Verify booking queue setup
      expect(mockConsumer.setupQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        [RoutingKey.BOOKING_CREATED, RoutingKey.BOOKING_CANCELLED],
        expect.objectContaining({
          deadLetterExchange: 'tutorgo_dlx',
          maxRetries: 3,
        })
      );

      // Verify payment queue setup
      expect(mockConsumer.setupQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_PAYMENT,
        [RoutingKey.PAYMENT_COMPLETED],
        expect.objectContaining({
          deadLetterExchange: 'tutorgo_dlx',
          maxRetries: 3,
        })
      );

      // Verify review queue setup
      expect(mockConsumer.setupQueue).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_REVIEW,
        [RoutingKey.REVIEW_SUBMITTED],
        expect.objectContaining({
          deadLetterExchange: 'tutorgo_dlx',
          maxRetries: 3,
        })
      );
    });

    it('should handle initialization errors', async () => {
      mockConnection.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(service.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('startConsuming', () => {
    it('should start consuming from all queues', async () => {
      await service.startConsuming();

      expect(mockConsumer.consume).toHaveBeenCalledTimes(3);

      // Verify booking queue consumer
      expect(mockConsumer.consume).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_BOOKING,
        expect.any(Function),
        expect.objectContaining({
          prefetchCount: 5,
          maxRetries: 3,
          retryDelay: 2000,
        })
      );

      // Verify payment queue consumer
      expect(mockConsumer.consume).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_PAYMENT,
        expect.any(Function),
        expect.objectContaining({
          prefetchCount: 5,
          maxRetries: 3,
          retryDelay: 2000,
        })
      );

      // Verify review queue consumer
      expect(mockConsumer.consume).toHaveBeenCalledWith(
        QueueName.NOTIFICATION_REVIEW,
        expect.any(Function),
        expect.objectContaining({
          prefetchCount: 5,
          maxRetries: 3,
          retryDelay: 2000,
        })
      );
    });
  });

  describe('handleBookingEvent', () => {
    it('should handle booking created event', async () => {
      let bookingHandler: any;
      mockConsumer.consume.mockImplementation((queue: string, handler: any) => {
        if (queue === QueueName.NOTIFICATION_BOOKING) {
          bookingHandler = handler;
        }
        return Promise.resolve();
      });

      await service.startConsuming();

      const event: BookingCreatedEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      await bookingHandler(event);

      expect(mockNotificationService.handleBookingCreated).toHaveBeenCalledWith(event);
    });

    it('should handle booking cancelled event', async () => {
      let bookingHandler: any;
      mockConsumer.consume.mockImplementation((queue: string, handler: any) => {
        if (queue === QueueName.NOTIFICATION_BOOKING) {
          bookingHandler = handler;
        }
        return Promise.resolve();
      });

      await service.startConsuming();

      const event: BookingCancelledEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        totalAmount: 50,
        cancellationReason: 'Student request',
        timestamp: new Date(),
      };

      await bookingHandler(event);

      expect(mockNotificationService.handleBookingCancelled).toHaveBeenCalledWith(event);
    });
  });

  describe('handlePaymentEvent', () => {
    it('should handle payment completed event', async () => {
      let paymentHandler: any;
      mockConsumer.consume.mockImplementation((queue: string, handler: any) => {
        if (queue === QueueName.NOTIFICATION_PAYMENT) {
          paymentHandler = handler;
        }
        return Promise.resolve();
      });

      await service.startConsuming();

      const event: PaymentCompletedEvent = {
        paymentId: 'payment-123',
        bookingId: 'booking-123',
        amount: 50,
        studentId: 'student-123',
        tutorId: 'tutor-123',
        timestamp: new Date(),
      };

      await paymentHandler(event);

      expect(mockNotificationService.handlePaymentCompleted).toHaveBeenCalledWith(event);
    });
  });

  describe('handleReviewEvent', () => {
    it('should handle review submitted event', async () => {
      let reviewHandler: any;
      mockConsumer.consume.mockImplementation((queue: string, handler: any) => {
        if (queue === QueueName.NOTIFICATION_REVIEW) {
          reviewHandler = handler;
        }
        return Promise.resolve();
      });

      await service.startConsuming();

      const event: ReviewSubmittedEvent = {
        reviewId: 'review-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        bookingId: 'booking-123',
        rating: 5,
        comment: 'Great tutor!',
        timestamp: new Date(),
      };

      await reviewHandler(event);

      expect(mockNotificationService.handleReviewSubmitted).toHaveBeenCalledWith(event);
    });
  });

  describe('shutdown', () => {
    it('should stop all consumers and disconnect', async () => {
      await service.shutdown();

      expect(mockConsumer.stopAll).toHaveBeenCalled();
      expect(mockConnection.disconnect).toHaveBeenCalled();
    });

    it('should handle shutdown errors', async () => {
      mockConsumer.stopAll.mockRejectedValue(new Error('Stop failed'));

      await expect(service.shutdown()).rejects.toThrow('Stop failed');
    });
  });
});
