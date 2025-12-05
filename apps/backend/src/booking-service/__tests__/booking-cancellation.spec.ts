import { BookingService } from '../services/booking.service';
import { RabbitMQService } from '../services/rabbitmq.service';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { CancelBookingDto } from '../dto';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    BookingStatus: {
      pending: 'pending',
      confirmed: 'confirmed',
      completed: 'completed',
      cancelled: 'cancelled',
    },
  };
});

// Mock RabbitMQ
jest.mock('../services/rabbitmq.service');

describe('BookingService - Cancellation Logic', () => {
  let bookingService: BookingService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockRabbitMQ: jest.Mocked<RabbitMQService>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    mockRabbitMQ = new RabbitMQService() as jest.Mocked<RabbitMQService>;
    mockRabbitMQ.publishBookingCancelledEvent = jest.fn().mockResolvedValue(undefined);
    bookingService = new BookingService(mockPrisma, mockRabbitMQ);
    jest.clearAllMocks();
  });

  describe('cancelBooking', () => {
    const bookingId = '123e4567-e89b-12d3-a456-426614174002';

    it('should cancel a pending booking successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3); // 3 days from now

      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 3600000), // 1 hour later
        status: BookingStatus.pending,
        totalAmount: 50,
        paymentId: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (mockPrisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.cancelled,
        cancellationReason: 'Student request',
      });

      const cancelData: CancelBookingDto = { reason: 'Student request' };
      const result = await bookingService.cancelBooking(bookingId, cancelData);

      expect(result.status).toBe('cancelled');
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: {
          status: BookingStatus.cancelled,
          cancellationReason: 'Student request',
        },
      });
      // Should not publish event if no payment was made
      expect(mockRabbitMQ.publishBookingCancelledEvent).not.toHaveBeenCalled();
    });

    it('should cancel a confirmed booking and trigger refund event', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 3600000),
        status: BookingStatus.confirmed,
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (mockPrisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.cancelled,
        cancellationReason: 'Change of plans',
      });

      const cancelData: CancelBookingDto = { reason: 'Change of plans' };
      const result = await bookingService.cancelBooking(bookingId, cancelData);

      expect(result.status).toBe('cancelled');
      expect(mockRabbitMQ.publishBookingCancelledEvent).toHaveBeenCalledWith({
        bookingId: mockBooking.id,
        tutorId: mockBooking.tutorId,
        studentId: mockBooking.studentId,
        totalAmount: 50,
        cancellationReason: 'Change of plans',
        timestamp: expect.any(Date),
      });
    });

    it('should throw error if booking not found', async () => {
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      const cancelData: CancelBookingDto = { reason: 'Test' };

      await expect(bookingService.cancelBooking(bookingId, cancelData)).rejects.toThrow(
        'Booking not found'
      );
    });

    it('should throw error if booking is already cancelled', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date(),
        endTime: new Date(),
        status: BookingStatus.cancelled,
        totalAmount: 50,
        paymentId: null,
        cancellationReason: 'Already cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const cancelData: CancelBookingDto = { reason: 'Test' };

      await expect(bookingService.cancelBooking(bookingId, cancelData)).rejects.toThrow(
        'Booking is already cancelled'
      );
    });

    it('should throw error if booking is completed', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date(),
        endTime: new Date(),
        status: BookingStatus.completed,
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const cancelData: CancelBookingDto = { reason: 'Test' };

      await expect(bookingService.cancelBooking(bookingId, cancelData)).rejects.toThrow(
        'Cannot cancel a completed booking'
      );
    });

    it('should throw error if cancellation deadline has passed', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() + 12); // 12 hours from now (less than 24 hours)

      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: pastDate,
        endTime: new Date(pastDate.getTime() + 3600000),
        status: BookingStatus.confirmed,
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const cancelData: CancelBookingDto = { reason: 'Test' };

      await expect(bookingService.cancelBooking(bookingId, cancelData)).rejects.toThrow(
        'Cancellation deadline has passed'
      );
    });

    it('should cancel booking even if RabbitMQ event publishing fails', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 3600000),
        status: BookingStatus.confirmed,
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (mockPrisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.cancelled,
        cancellationReason: 'Test',
      });

      // Mock RabbitMQ failure
      mockRabbitMQ.publishBookingCancelledEvent = jest
        .fn()
        .mockRejectedValue(new Error('RabbitMQ error'));

      const cancelData: CancelBookingDto = { reason: 'Test' };
      const result = await bookingService.cancelBooking(bookingId, cancelData);

      // Should still succeed even if event publishing fails
      expect(result.status).toBe('cancelled');
    });

    it('should cancel booking without reason', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 3600000),
        status: BookingStatus.pending,
        totalAmount: 50,
        paymentId: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (mockPrisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.cancelled,
        cancellationReason: undefined,
      });

      const cancelData: CancelBookingDto = {};
      const result = await bookingService.cancelBooking(bookingId, cancelData);

      expect(result.status).toBe('cancelled');
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: {
          status: BookingStatus.cancelled,
          cancellationReason: undefined,
        },
      });
    });
  });
});
