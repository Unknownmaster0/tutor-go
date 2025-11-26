import { body, param, query } from 'express-validator';

export const createBookingValidator = [
  body('tutorId').isUUID().withMessage('Tutor ID must be a valid UUID'),
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
  body('subject').isString().trim().notEmpty().withMessage('Subject is required'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
];

export const updateBookingStatusValidator = [
  param('id').isUUID().withMessage('Booking ID must be a valid UUID'),
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, completed, cancelled'),
];

export const cancelBookingValidator = [
  param('id').isUUID().withMessage('Booking ID must be a valid UUID'),
  body('reason').optional().isString().trim(),
];

export const getBookingValidator = [
  param('id').isUUID().withMessage('Booking ID must be a valid UUID'),
];

export const getUserBookingsValidator = [
  param('userId').isUUID().withMessage('User ID must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, completed, cancelled'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  query('subject').optional().isString().trim(),
];
