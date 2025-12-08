import { RabbitMQService } from '../services/rabbitmq.service';
import {
  createRabbitMQConnection,
  createPublisher,
  BookingCreatedEvent,
  BookingCancelledEvent,
} from '../../shared/rabbitmq';

// Mock the shared RabbitMQ module
jest.mock('../../shared/rabbitmq', () => ({
  ...jest.requireActual('../../shared/rabbitmq'),
  createRabbitMQConnection: jest.fn(),
  createPublisher: jest.fn(),
}));

describe('Booking Service - RabbitMQService', () => {
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
      publishBookingCreated: jest.fn().mockResolvedValue(undefined),
      publishBookingCancelled: jest.fn().mockResolvedValue(undefined),
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

  describe('publishBookingCreatedEvent', () => {
    it('should publish booking created event', async () => {
      const event: BookingCreatedEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      await service.publishBookingCreatedEvent(event);

      expect(mockPublisher.publishBookingCreated).toHaveBeenCalledWith(event);
    });

    it('should handle publish errors', async () => {
      mockPublisher.publishBookingCreated.mockRejectedValue(new Error('Publish failed'));

      const event: BookingCreatedEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      await expect(service.publishBookingCreatedEvent(event)).rejects.toThrow('Publish failed');
    });
  });

  describe('publishBookingCancelledEvent', () => {
    it('should publish booking cancelled event', async () => {
      const event: BookingCancelledEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        totalAmount: 50,
        cancellationReason: 'Student request',
        timestamp: new Date(),
      };

      await service.publishBookingCancelledEvent(event);

      expect(mockPublisher.publishBookingCancelled).toHaveBeenCalledWith(event);
    });

    it('should handle publish errors', async () => {
      mockPublisher.publishBookingCancelled.mockRejectedValue(new Error('Publish failed'));

      const event: BookingCancelledEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        totalAmount: 50,
        timestamp: new Date(),
      };

      await expect(service.publishBookingCancelledEvent(event)).rejects.toThrow('Publish failed');
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
