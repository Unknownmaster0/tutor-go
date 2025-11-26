import { Request, Response } from 'express';
import { BookingService } from '../services';
import { CreateBookingDto, UpdateBookingStatusDto, CancelBookingDto } from '../dto';
import { BookingStatus } from '@prisma/client';

export class BookingController {
  private bookingService: BookingService;

  constructor(bookingService: BookingService) {
    this.bookingService = bookingService;
  }

  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateBookingDto = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };

      const booking = await this.bookingService.createBooking(data);

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create booking',
        },
      });
    }
  };

  getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const booking = await this.bookingService.getBookingById(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Booking not found',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get booking',
        },
      });
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

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get bookings',
        },
      });
    }
  };

  updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateBookingStatusDto = req.body;

      const booking = await this.bookingService.updateBookingStatus(id, data);

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update booking status',
        },
      });
    }
  };

  cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: CancelBookingDto = req.body;

      const booking = await this.bookingService.cancelBooking(id, data);

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to cancel booking',
        },
      });
    }
  };
}
