import { RabbitMQService } from '../services/rabbitmq.service';
import {
  createRabbitMQConnection,
  createPublisher,
  ReviewSubmittedEvent,
} from '../../shared/rabbitmq';

// Mock the shared RabbitMQ module
jest.mock('../../shared/rabbitmq', () => ({
  ...jest.requireActual('../../shared/rabbitmq'),
  createRabbitMQConnection: jest.fn(),
  createPublisher: jest.fn(),
}));

describe('Tutor Service - RabbitMQService', () => {
  let service: RabbitMQService;
  let mockConnection: any;
  let mockPublisher: any;

  beforeEach(() => {
    mockConnection = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
    };

    mockPublisher = {
      publishReviewSubmitted: jest.fn().mockResolvedValue(undefined),
    };

    (createRabbitMQConnection as jest.Mock).mockReturnValue(mockConnection);
    (createPublisher as jest.Mock).mockReturnValue(mockPublisher);

    service = new RabbitMQService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to RabbitMQ', async () => {
      await service.connect();

      expect(mockConnection.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      mockConnection.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(service.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('publishReviewSubmittedEvent', () => {
    it('should publish review submitted event', async () => {
      const event: ReviewSubmittedEvent = {
        reviewId: 'review-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        bookingId: 'booking-123',
        rating: 5,
        comment: 'Great tutor!',
        timestamp: new Date(),
      };

      await service.publishReviewSubmittedEvent(event);

      expect(mockPublisher.publishReviewSubmitted).toHaveBeenCalledWith(event);
    });

    it('should handle publish errors', async () => {
      mockPublisher.publishReviewSubmitted.mockRejectedValue(new Error('Publish failed'));

      const event: ReviewSubmittedEvent = {
        reviewId: 'review-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        bookingId: 'booking-123',
        rating: 5,
        timestamp: new Date(),
      };

      await expect(service.publishReviewSubmittedEvent(event)).rejects.toThrow('Publish failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from RabbitMQ', async () => {
      await service.disconnect();

      expect(mockConnection.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect errors', async () => {
      mockConnection.disconnect.mockRejectedValue(new Error('Disconnect failed'));

      await expect(service.disconnect()).rejects.toThrow('Disconnect failed');
    });
  });
});
