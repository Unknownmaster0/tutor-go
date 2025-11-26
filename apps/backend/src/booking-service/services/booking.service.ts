import { PrismaClient, Booking, BookingStatus } from '@prisma/client';
import { CreateBookingDto, BookingResponseDto, UpdateBookingStatusDto, CancelBookingDto } from '../dto';
import { TutorProfile } from '../../shared/database';
import { RabbitMQService } from './rabbitmq.service';

export class BookingService {
  private prisma: PrismaClient;
  private rabbitMQService?: RabbitMQService;

  constructor(prisma: PrismaClient, rabbitMQService?: RabbitMQService) {
    this.prisma = prisma;
    this.rabbitMQService = rabbitMQService;
  }

  async createBooking(data: CreateBookingDto): Promise<BookingResponseDto> {
    // Validate that tutor and student exist
    const [tutor, student] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: data.tutorId } }),
      this.prisma.user.findUnique({ where: { id: data.studentId } }),
    ]);

    if (!tutor || tutor.role !== 'tutor') {
      throw new Error('Tutor not found');
    }

    if (!student || student.role !== 'student') {
      throw new Error('Student not found');
    }

    // Validate time range
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new Error('Cannot book sessions in the past');
    }

    // Check tutor availability
    const isAvailable = await this.checkTutorAvailability(data.tutorId, startTime, endTime);
    if (!isAvailable) {
      throw new Error('Tutor is not available during the selected time slot');
    }

    // Check for double booking (prevent overlapping bookings)
    const hasConflict = await this.checkBookingConflict(data.tutorId, startTime, endTime);
    if (hasConflict) {
      throw new Error('Time slot is already booked');
    }

    // Create booking with "pending" status
    const booking = await this.prisma.booking.create({
      data: {
        tutorId: data.tutorId,
        studentId: data.studentId,
        subject: data.subject,
        startTime,
        endTime,
        totalAmount: data.totalAmount,
        status: BookingStatus.pending,
      },
    });

    return this.mapToResponseDto(booking);
  }

  async getBookingById(id: string): Promise<BookingResponseDto | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return null;
    }

    return this.mapToResponseDto(booking);
  }

  async getUserBookings(
    userId: string,
    filters?: {
      status?: BookingStatus;
      startDate?: Date;
      endDate?: Date;
      subject?: string;
    }
  ): Promise<BookingResponseDto[]> {
    const where: any = {
      OR: [{ tutorId: userId }, { studentId: userId }],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startTime.lte = filters.endDate;
      }
    }

    if (filters?.subject) {
      where.subject = {
        contains: filters.subject,
        mode: 'insensitive',
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      orderBy: {
        startTime: 'desc',
      },
    });

    return bookings.map((booking) => this.mapToResponseDto(booking));
  }

  async updateBookingStatus(id: string, data: UpdateBookingStatusDto): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate status transitions
    this.validateStatusTransition(booking.status, data.status);

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: data.status,
      },
    });

    return this.mapToResponseDto(updatedBooking);
  }

  async cancelBooking(id: string, data: CancelBookingDto): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === BookingStatus.cancelled) {
      throw new Error('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.completed) {
      throw new Error('Cannot cancel a completed booking');
    }

    // Check cancellation deadline (e.g., 24 hours before start time)
    const cancellationDeadline = new Date(booking.startTime);
    cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);

    if (new Date() > cancellationDeadline) {
      throw new Error('Cancellation deadline has passed (must cancel at least 24 hours before session)');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.cancelled,
        cancellationReason: data.reason,
      },
    });

    // Trigger refund process via RabbitMQ if payment was made
    if (booking.paymentId && this.rabbitMQService) {
      try {
        await this.rabbitMQService.publishBookingCancelledEvent({
          bookingId: booking.id,
          tutorId: booking.tutorId,
          studentId: booking.studentId,
          totalAmount: Number(booking.totalAmount),
          cancellationReason: data.reason,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Failed to publish booking cancelled event:', error);
        // Don't fail the cancellation if event publishing fails
      }
    }

    return this.mapToResponseDto(updatedBooking);
  }

  private async checkTutorAvailability(
    tutorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    // Get tutor profile from MongoDB
    const tutorProfile = await TutorProfile.findOne({ userId: tutorId });

    if (!tutorProfile || !tutorProfile.availability || tutorProfile.availability.length === 0) {
      return false;
    }

    // Get day of week and time for the booking
    const dayOfWeek = startTime.getDay();
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // Check if the booking time falls within any availability slot
    const hasMatchingSlot = tutorProfile.availability.some((slot) => {
      if (slot.dayOfWeek !== dayOfWeek) {
        return false;
      }

      const [slotStartHour, slotStartMin] = slot.startTime.split(':').map(Number);
      const [slotEndHour, slotEndMin] = slot.endTime.split(':').map(Number);

      const slotStartMinutes = slotStartHour * 60 + slotStartMin;
      const slotEndMinutes = slotEndHour * 60 + slotEndMin;

      return startTimeMinutes >= slotStartMinutes && endTimeMinutes <= slotEndMinutes;
    });

    return hasMatchingSlot;
  }

  private async checkBookingConflict(
    tutorId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const where: any = {
      tutorId,
      status: {
        in: [BookingStatus.pending, BookingStatus.confirmed],
      },
      OR: [
        {
          // New booking starts during existing booking
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        {
          // New booking ends during existing booking
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        {
          // New booking completely contains existing booking
          AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
        },
      ],
    };

    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const conflictingBookings = await this.prisma.booking.findMany({
      where,
    });

    return conflictingBookings.length > 0;
  }

  private validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): void {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.pending]: [BookingStatus.confirmed, BookingStatus.cancelled],
      [BookingStatus.confirmed]: [BookingStatus.completed, BookingStatus.cancelled],
      [BookingStatus.completed]: [],
      [BookingStatus.cancelled]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  private mapToResponseDto(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      tutorId: booking.tutorId,
      studentId: booking.studentId,
      subject: booking.subject,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
      totalAmount: Number(booking.totalAmount),
      paymentId: booking.paymentId || undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
