import { BookingService } from '../services/booking.service';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { TutorProfile } from '../../shared/database';
import { CreateBookingDto } from '../dto';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
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

// Mock TutorProfile
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    findOne: jest.fn(),
  },
}));

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    bookingService = new BookingService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const validBookingData: CreateBookingDto = {
      tutorId: '123e4567-e89b-12d3-a456-426614174000',
      studentId: '123e4567-e89b-12d3-a456-426614174001',
      subject: 'Mathematics',
      startTime: new Date('2025-12-01T10:00:00Z'),
      endTime: new Date('2025-12-01T11:00:00Z'),
      totalAmount: 50,
    };

    it('should create a booking successfully', async () => {
      // Mock user validation
      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: validBookingData.tutorId, role: 'tutor' })
        .mockResolvedValueOnce({ id: validBookingData.studentId, role: 'student' });

      // Mock tutor availability
      (TutorProfile.findOne as jest.Mock).mockResolvedValue({
        userId: validBookingData.tutorId,
        availability: [
          {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00',
          },
        ],
      });

      // Mock no booking conflicts
      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue([]);

      // Mock booking creation
      const mockBooking = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        ...validBookingData,
        status: BookingStatus.pending,
        paymentId: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockPrisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);

      const result = await bookingService.createBooking(validBookingData);

      expect(result).toMatchObject({
        id: mockBooking.id,
        tutorId: validBookingData.tutorId,
        studentId: validBookingData.studentId,
        subject: validBookingData.subject,
        status: 'pending',
        totalAmount: validBookingData.totalAmount,
      });
      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tutorId: validBookingData.tutorId,
          studentId: validBookingData.studentId,
          subject: validBookingData.subject,
          status: BookingStatus.pending,
        }),
      });
    });

    it('should throw error if tutor not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: validBookingData.studentId, role: 'student' });

      await expect(bookingService.createBooking(validBookingData)).rejects.toThrow(
        'Tutor not found'
      );
    });

    it('should throw error if student not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: validBookingData.tutorId, role: 'tutor' })
        .mockResolvedValueOnce(null);

      await expect(bookingService.createBooking(validBookingData)).rejects.toThrow(
        'Student not found'
      );
    });

    it('should throw error if end time is before start time', async () => {
      const invalidData = {
        ...validBookingData,
        startTime: new Date('2025-12-01T11:00:00Z'),
        endTime: new Date('2025-12-01T10:00:00Z'),
      };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: validBookingData.tutorId, role: 'tutor' })
        .mockResolvedValueOnce({ id: validBookingData.studentId, role: 'student' });

      await expect(bookingService.createBooking(invalidData)).rejects.toThrow(
        'End time must be after start time'
      );
    });

    it('should throw error if booking in the past', async () => {
      const pastData = {
        ...validBookingData,
        startTime: new Date('2020-01-01T10:00:00Z'),
        endTime: new Date('2020-01-01T11:00:00Z'),
      };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: validBookingData.tutorId, role: 'tutor' })
        .mockResolvedValueOnce({ id: validBookingData.studentId, role: 'student' });

      await expect(bookingService.createBooking(pastData)).rejects.toThrow(
        'Cannot book sessions in the past'
      );
    });

    it('should throw error if tutor is not available', async () => {
      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: validBookingData.tutorId, role: 'tutor' })
        .mockResolvedValueOnce({ id: validBookingData.studentId, role: 'student' });

      // Mock tutor with no availability
      (TutorProfile.findOne as jest.Mock).mockResolvedValue({
        userId: validBookingData.tutorId,
        availability: [],
      });

      await expect(bookingService.createBooking(validBookingData)).rejects.toThrow(
        'Tutor is not available during the selected time slot'
      );
    });

    it('should throw error if time slot is already booked', async () => {
      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: validBookingData.tutorId, role: 'tutor' })
        .mockResolvedValueOnce({ id: validBookingData.studentId, role: 'student' });

      (TutorProfile.findOne as jest.Mock).mockResolvedValue({
        userId: validBookingData.tutorId,
        availability: [
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
          },
        ],
      });

      // Mock existing booking conflict
      (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'existing-booking',
          tutorId: validBookingData.tutorId,
          startTime: validBookingData.startTime,
          endTime: validBookingData.endTime,
          status: BookingStatus.confirmed,
        },
      ]);

      await expect(bookingService.createBooking(validBookingData)).rejects.toThrow(
        'Time slot is already booked'
      );
    });
  });

  describe('getBookingById', () => {
    it('should return booking if found', async () => {
      const mockBooking = {
        id: '123e4567-e89b-12d3-a456-426614174002',
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

      const result = await bookingService.getBookingById(mockBooking.id);

      expect(result).toMatchObject({
        id: mockBooking.id,
        tutorId: mockBooking.tutorId,
        studentId: mockBooking.studentId,
        status: 'pending',
      });
    });

    it('should return null if booking not found', async () => {
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await bookingService.getBookingById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings with filters', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
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
          paymentId: null,
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
        where: expect.objectContaining({
          OR: [{ tutorId: userId }, { studentId: userId }],
          status: BookingStatus.confirmed,
        }),
        orderBy: { startTime: 'desc' },
      });
    });
  });
});
