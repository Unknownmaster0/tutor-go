import { body, ValidationChain } from 'express-validator';

export class PaymentValidator {
  static createPaymentIntent(): ValidationChain[] {
    return [
      body('bookingId')
        .notEmpty()
        .withMessage('Booking ID is required')
        .isUUID()
        .withMessage('Booking ID must be a valid UUID'),
      body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),
      body('currency')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be a 3-letter code'),
    ];
  }

  static confirmPayment(): ValidationChain[] {
    return [
      body('paymentIntentId')
        .notEmpty()
        .withMessage('Payment intent ID is required')
        .isString()
        .withMessage('Payment intent ID must be a string'),
      body('bookingId')
        .notEmpty()
        .withMessage('Booking ID is required')
        .isUUID()
        .withMessage('Booking ID must be a valid UUID'),
    ];
  }

  static refundPayment(): ValidationChain[] {
    return [
      body('paymentId')
        .notEmpty()
        .withMessage('Payment ID is required')
        .isUUID()
        .withMessage('Payment ID must be a valid UUID'),
      body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
      body('reason')
        .notEmpty()
        .withMessage('Refund reason is required')
        .isString()
        .withMessage('Reason must be a string')
        .isLength({ min: 5, max: 500 })
        .withMessage('Reason must be between 5 and 500 characters'),
    ];
  }
}
