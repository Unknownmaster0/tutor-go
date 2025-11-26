import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { asyncHandler } from '../../shared';
import {
  createBookingValidator,
  updateBookingStatusValidator,
  cancelBookingValidator,
  getBookingValidator,
  getUserBookingsValidator,
} from '../validators/booking.validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array(),
      },
    });
    return;
  }
  next();
};

export const createBookingRoutes = (bookingController: BookingController): Router => {
  const router = Router();

  // POST /bookings - Create a new booking
  router.post('/', createBookingValidator, validateRequest, asyncHandler(bookingController.createBooking));

  // GET /bookings/:id - Get booking by ID
  router.get('/:id', getBookingValidator, validateRequest, asyncHandler(bookingController.getBookingById));

  // GET /bookings/user/:userId - Get user's bookings
  router.get(
    '/user/:userId',
    getUserBookingsValidator,
    validateRequest,
    asyncHandler(bookingController.getUserBookings)
  );

  // PATCH /bookings/:id/status - Update booking status
  router.patch(
    '/:id/status',
    updateBookingStatusValidator,
    validateRequest,
    asyncHandler(bookingController.updateBookingStatus)
  );

  // PATCH /bookings/:id/cancel - Cancel booking
  router.patch(
    '/:id/cancel',
    cancelBookingValidator,
    validateRequest,
    asyncHandler(bookingController.cancelBooking)
  );

  return router;
};
