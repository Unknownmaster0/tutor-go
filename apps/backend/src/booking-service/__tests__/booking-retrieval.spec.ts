import { BookingService } from '../services/booking.service';
import { PrismaClient, BookingStatus } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    booking: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
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

describe('BookingService - Retrieval Endpoints', () => {
  let bookingService: BookingService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    bookingService = new BookingService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getBookingById', () => {
    const bookingId = '123e4567-e89b-12d3-a456-426614174002';

    it('should return booking details by ID', async () => {
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
        createdAt: new Date('2025-11-01T10:00:00Z'),
        updatedAt: new Date('2025-11-01T10:00:00Z'),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      const result = await bookingService.getBookingById(bookingId);

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        id: bookingId,
        tutorId: mockBooking.tutorId,
        studentId: mockBooking.studentId,
        subject: 'Mathematics',
        status: 'confirmed',
        totalAmount: 50,
        paymentId: 'payment-123',
      });
      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
    });

    it('should return null if booking not found', async () => {
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await bookingService.getBookingById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return booking with all statuses', async () => {
      const statuses: BookingStatus[] = [
        BookingStatus.pending,
        BookingStatus.confirmed,
        BookingStatus.completed,
        BookingStatus.cancelled,
      ];

      for (const status of statuses) {
        const mockBooking = {
          id: bookingId,
          tutorId: '123e4567-e89b-12d3-a456-426614174000',
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Mathematics',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T11:00:00Z'),
          status,
          totalAmount: 50,
          paymentId: status === BookingStatus.pending ? null : 'payment-123',
          cancellationReason: status === BookingStatus.cancelled ? 'Test reason' : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

        const result = await bookingService.getBookingById(bookingId);

        expect(result?.status).toBe(status);
      }
    });
  });

  describe('getUserBookings', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return all bookings for a user', async () => {
      const mockBookings = [
        {
          id: '1',
          tutorId: userId,
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Mathematics',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T11:00:00Z'),
          status: BookingStatus.confirmed,
          totalAmount: 50,
          paymentId: 'payment-1',
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          tutorId: '123e4567-e89b-12d3-a456-426614174002',
          studentId: userId,
          subject: 'Physics',
          startTime: new Date('2025-12-02T14:00:00Z'),
          endTime: new Date('2025-12-02T15:00:00Z'),
          status: BookingStatus.pending,
          totalAmount: 60,
          paymentId: null,
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingService.getUserBookings(userId);

      expect(result).toHaveLength(2);
      expect(result[0].subject).toBe('Mathematics');
      expect(result[1].subject).toBe('Physics');
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ tutorId: userId }, { studentId: userId }],
        },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should filter bookings by status', async () => {
      const mockBookings = [
        {
          id: '1',
          tutorId: userId,
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Mathematics',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T11:00:00Z'),
          status: BookingStatus.confirmed,
          totalAmount: 50,
          paymentId: 'payment-1',
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingService.getUserBookings(userId, {
        status: BookingStatus.confirmed,
      });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('confirmed');
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ tutorId: userId }, { studentId: userId }],
          status: BookingStatus.confirmed,
        },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should filter bookings by date range', async () => {
      const startDate = new Date('2025-12-01T00:00:00Z');
      const endDate = new Date('2025-12-31T23:59:59Z');

      const mockBookings = [
        {
          id: '1',
          tutorId: userId,
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Mathematics',
          startTime: new Date('2025-12-15T10:00:00Z'),
          endTime: new Date('2025-12-15T11:00:00Z'),
          status: BookingStatus.confirmed,
          totalAmount: 50,
          paymentId: 'payment-1',
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingService.getUserBookings(userId, {
        startDate,
        endDate,
      });

      expect(result).toHaveLength(1);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ tutorId: userId }, { studentId: userId }],
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should filter bookings by subject', async () => {
      const mockBookings = [
        {
          id: '1',
          tutorId: userId,
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Mathematics',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T11:00:00Z'),
          status: BookingStatus.confirmed,
          totalAmount: 50,
          paymentId: 'payment-1',
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingService.getUserBookings(userId, {
        subject: 'Math',
      });

      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Mathematics');
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ tutorId: userId }, { studentId: userId }],
          subject: {
            contains: 'Math',
            mode: 'insensitive',
          },
        },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should filter bookings with multiple filters', async () => {
      const startDate = new Date('2025-12-01T00:00:00Z');
      const endDate = new Date('2025-12-31T23:59:59Z');

      const mockBookings = [
        {
          id: '1',
          tutorId: userId,
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Mathematics',
          startTime: new Date('2025-12-15T10:00:00Z'),
          endTime: new Date('2025-12-15T11:00:00Z'),
          status: BookingStatus.confirmed,
          totalAmount: 50,
          paymentId: 'payment-1',
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingService.getUserBookings(userId, {
        status: BookingStatus.confirmed,
        startDate,
        endDate,
        subject: 'Math',
      });

      expect(result).toHaveLength(1);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ tutorId: userId }, { studentId: userId }],
          status: BookingStatus.confirmed,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
          subject: {
            contains: 'Math',
            mode: 'insensitive',
          },
        },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should return empty array if no bookings found', async () => {
      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue([]);

      const result = await bookingService.getUserBookings(userId);

      expect(result).toEqual([]);
    });

    it('should return bookings ordered by start time descending', async () => {
      const mockBookings = [
        {
          id: '2',
          tutorId: userId,
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Physics',
          startTime: new Date('2025-12-02T14:00:00Z'),
          endTime: new Date('2025-12-02T15:00:00Z'),
          status: BookingStatus.pending,
          totalAmount: 60,
          paymentId: null,
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '1',
          tutorId: userId,
          studentId: '123e4567-e89b-12d3-a456-426614174001',
          subject: 'Mathematics',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T11:00:00Z'),
          status: BookingStatus.confirmed,
          totalAmount: 50,
          paymentId: 'payment-1',
          cancellationReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await bookingService.getUserBookings(userId);

      expect(result[0].subject).toBe('Physics'); // More recent
      expect(result[1].subject).toBe('Mathematics'); // Older
    });
  });
});
