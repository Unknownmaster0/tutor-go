import { Request, Response } from 'express';
import { BookingService } from '../services';
import { CreateBookingDto, UpdateBookingStatusDto, CancelBookingDto } from '../dto';
import { BookingStatus } from '@prisma/client';

import { ApiResponse } from '../../shared';

export class BookingController {
  private bookingService: BookingService;

  constructor(bookingService: BookingService) {
    this.bookingService = bookingService;
  }

  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const data: CreateBookingDto = {
        ...req.body,
        studentId: userId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };

      const booking = await this.bookingService.createBooking(data);

      ApiResponse.success(res, booking, 'Booking created successfully', 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      ApiResponse.error(res, errorMessage, 400);
    }
  };

  getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const booking = await this.bookingService.getBookingById(id);

      if (!booking) {
        ApiResponse.error(res, 'Booking not found', 404);
        return;
      }

      ApiResponse.success(res, booking, 'Booking retrieved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get booking';
      ApiResponse.error(res, errorMessage, 500);
    }
  };

  getUserBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { status, startDate, endDate, subject } = req.query;

      const filters: any = {};

      if (status) {
        filters.status = status as BookingStatus;
      }

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }

      if (subject) {
        filters.subject = subject as string;
      }

      const bookings = await this.bookingService.getUserBookings(userId, filters);

      ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get bookings';
      ApiResponse.error(res, errorMessage, 500);
    }
  };

  updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateBookingStatusDto = req.body;

      const booking = await this.bookingService.updateBookingStatus(id, data);

      ApiResponse.success(res, booking, 'Booking status updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking status';
      ApiResponse.error(res, errorMessage, 400);
    }
  };

  cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: CancelBookingDto = req.body;

      const booking = await this.bookingService.cancelBooking(id, data);

      ApiResponse.success(res, booking, 'Booking cancelled successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      ApiResponse.error(res, errorMessage, 400);
    }
  };
}
