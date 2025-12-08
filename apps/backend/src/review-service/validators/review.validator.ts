import { body, param, query } from 'express-validator';

export const createReviewValidator = [
  body('tutorId').isUUID().withMessage('Tutor ID must be a valid UUID'),
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
  body('bookingId').isUUID().withMessage('Booking ID must be a valid UUID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be a string with maximum 1000 characters'),
];

export const getTutorReviewsValidator = [
  param('tutorId').isUUID().withMessage('Tutor ID must be a valid UUID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

export const flagReviewValidator = [
  param('reviewId').isUUID().withMessage('Review ID must be a valid UUID'),
  body('flagged').isBoolean().withMessage('Flagged must be a boolean'),
];
