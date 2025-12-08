import { body, param } from 'express-validator';

/**
 * Validation rules for notification endpoints
 */

export const createNotificationValidation = [
  body('userId').isUUID().withMessage('Invalid user ID format'),
  body('type')
    .isIn(['booking', 'payment', 'message', 'review'])
    .withMessage('Type must be one of: booking, payment, message, review'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('message').notEmpty().withMessage('Message is required'),
  body('metadata').optional(),
];

export const markAsReadValidation = [
  body('read').isBoolean().withMessage('Read must be a boolean'),
];

export const getUserNotificationsValidation = [
  param('userId').isUUID().withMessage('Invalid user ID format'),
];

export const getNotificationByIdValidation = [
  param('id').isUUID().withMessage('Invalid notification ID format'),
];

export const markAsReadParamValidation = [
  param('id').isUUID().withMessage('Invalid notification ID format'),
];
