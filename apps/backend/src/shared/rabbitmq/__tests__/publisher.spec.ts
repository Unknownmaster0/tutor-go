import { RabbitMQPublisher } from '../publisher';
import { RabbitMQConnection } from '../connection';
import { RoutingKey, BookingCreatedEvent } from '../types';

describe('RabbitMQPublisher', () => {
  let publisher: RabbitMQPublisher;
  let mockConnection: jest.Mocked<RabbitMQConnection>;
  let mockChannel: any;

  beforeEach(() => {
    mockChannel = {
      publish: jest.fn().mockReturnValue(true),
    };

    mockConnection = {
      isConnected: jest.fn().mockReturnValue(true),
      getChannel: jest.fn().mockReturnValue(mockChannel),
    } as any;

    publisher = new RabbitMQPublisher(mockConnection, 'test_exchange');
  });

  describe('publish', () => {
    it('should publish event successfully', async () => {
      const event: BookingCreatedEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      await publisher.publish(RoutingKey.BOOKING_CREATED, event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test_exchange',
        RoutingKey.BOOKING_CREATED,
        expect.any(Buffer),
        expect.objectContaining({
          persistent: true,
          contentType: 'application/json',
          timestamp: expect.any(Number),
        })
      );

      const publishedMessage = JSON.parse(
        mockChannel.publish.mock.calls[0][2].toString()
      );
      expect(publishedMessage.bookingId).toBe(event.bookingId);
      expect(publishedMessage.tutorId).toBe(event.tutorId);
      expect(publishedMessage.studentId).toBe(event.studentId);
      expect(publishedMessage.subject).toBe(event.subject);
      expect(publishedMessage.totalAmount).toBe(event.totalAmount);
    });

    it('should throw error when not connected', async () => {
      mockConnection.isConnected.mockReturnValue(false);

      const event: BookingCreatedEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      await expect(
        publisher.publish(RoutingKey.BOOKING_CREATED, event)
      ).rejects.toThrow('RabbitMQ not connected. Call connect() first.');
    });

    it('should throw error when channel buffer is full', async () => {
      mockChannel.publish.mockReturnValue(false);

      const event: BookingCreatedEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      await expect(
        publisher.publish(RoutingKey.BOOKING_CREATED, event)
      ).rejects.toThrow('Failed to publish message - channel buffer full');
    });

    it('should handle publish errors', async () => {
      mockChannel.publish.mockImplementation(() => {
        throw new Error('Publish failed');
      });

      const event: BookingCreatedEvent = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      await expect(
        publisher.publish(RoutingKey.BOOKING_CREATED, event)
      ).rejects.toThrow('Publish failed');
    });
  });

  describe('publishBookingCreated', () => {
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

      await publisher.publishBookingCreated(event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test_exchange',
        RoutingKey.BOOKING_CREATED,
        expect.any(Buffer),
        expect.any(Object)
      );
    });
  });

  describe('publishBookingCancelled', () => {
    it('should publish booking cancelled event', async () => {
      const event = {
        bookingId: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        totalAmount: 50,
        timestamp: new Date(),
      };

      await publisher.publishBookingCancelled(event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test_exchange',
        RoutingKey.BOOKING_CANCELLED,
        expect.any(Buffer),
        expect.any(Object)
      );
    });
  });

  describe('publishPaymentCompleted', () => {
    it('should publish payment completed event', async () => {
      const event = {
        paymentId: 'payment-123',
        bookingId: 'booking-123',
        amount: 50,
        studentId: 'student-123',
        tutorId: 'tutor-123',
        timestamp: new Date(),
      };

      await publisher.publishPaymentCompleted(event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test_exchange',
        RoutingKey.PAYMENT_COMPLETED,
        expect.any(Buffer),
        expect.any(Object)
      );
    });
  });

  describe('publishReviewSubmitted', () => {
    it('should publish review submitted event', async () => {
      const event = {
        reviewId: 'review-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        bookingId: 'booking-123',
        rating: 5,
        timestamp: new Date(),
      };

      await publisher.publishReviewSubmitted(event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test_exchange',
        RoutingKey.REVIEW_SUBMITTED,
        expect.any(Buffer),
        expect.any(Object)
      );
    });
  });
});
