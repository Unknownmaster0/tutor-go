import { BookingService } from '../services/booking.service';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { UpdateBookingStatusDto } from '../dto';

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

describe('BookingService - Status Management', () => {
  let bookingService: BookingService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    bookingService = new BookingService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('updateBookingStatus', () => {
    const bookingId = '123e4567-e89b-12d3-a456-426614174002';

    it('should update status from pending to confirmed', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
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
        status: BookingStatus.confirmed,
      });

      const updateData: UpdateBookingStatusDto = { status: 'confirmed' };
      const result = await bookingService.updateBookingStatus(bookingId, updateData);

      expect(result.status).toBe('confirmed');
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: 'confirmed' },
      });
    });

    it('should update status from pending to cancelled', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
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
      });

      const updateData: UpdateBookingStatusDto = { status: 'cancelled' };
      const result = await bookingService.updateBookingStatus(bookingId, updateData);

      expect(result.status).toBe('cancelled');
    });

    it('should update status from confirmed to completed', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
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
        status: BookingStatus.completed,
      });

      const updateData: UpdateBookingStatusDto = { status: 'completed' };
      const result = await bookingService.updateBookingStatus(bookingId, updateData);

      expect(result.status).toBe('completed');
    });

    it('should update status from confirmed to cancelled', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
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
      });

      const updateData: UpdateBookingStatusDto = { status: 'cancelled' };
      const result = await bookingService.updateBookingStatus(bookingId, updateData);

      expect(result.status).toBe('cancelled');
    });

    it('should throw error if booking not found', async () => {
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      const updateData: UpdateBookingStatusDto = { status: 'confirmed' };

      await expect(
        bookingService.updateBookingStatus(bookingId, updateData)
      ).rejects.toThrow('Booking not found');
    });

    it('should throw error for invalid status transition from pending to completed', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
        status: BookingStatus.pending,
        totalAmount: 50,
        paymentId: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const updateData: UpdateBookingStatusDto = { status: 'completed' };

      await expect(
        bookingService.updateBookingStatus(bookingId, updateData)
      ).rejects.toThrow('Invalid status transition from pending to completed');
    });

    it('should throw error for invalid status transition from completed to any status', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
        status: BookingStatus.completed,
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const updateData: UpdateBookingStatusDto = { status: 'cancelled' };

      await expect(
        bookingService.updateBookingStatus(bookingId, updateData)
      ).rejects.toThrow('Invalid status transition from completed to cancelled');
    });

    it('should throw error for invalid status transition from cancelled to any status', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
        status: BookingStatus.cancelled,
        totalAmount: 50,
        paymentId: null,
        cancellationReason: 'Student request',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const updateData: UpdateBookingStatusDto = { status: 'confirmed' };

      await expect(
        bookingService.updateBookingStatus(bookingId, updateData)
      ).rejects.toThrow('Invalid status transition from cancelled to confirmed');
    });

    it('should throw error for invalid status transition from confirmed to pending', async () => {
      const mockBooking = {
        id: bookingId,
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        studentId: '123e4567-e89b-12d3-a456-426614174001',
        subject: 'Mathematics',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T11:00:00Z'),
        status: BookingStatus.confirmed,
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const updateData: UpdateBookingStatusDto = { status: 'pending' };

      await expect(
        bookingService.updateBookingStatus(bookingId, updateData)
      ).rejects.toThrow('Invalid status transition from confirmed to pending');
    });
  });
});
