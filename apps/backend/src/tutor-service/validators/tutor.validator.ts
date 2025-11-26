import { body, query } from 'express-validator';

export const createTutorProfileValidation = [
  body('userId').isString().notEmpty().withMessage('User ID is required'),
  body('bio').isString().notEmpty().withMessage('Bio is required'),
  body('qualifications').isArray().withMessage('Qualifications must be an array'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('subjects.*.name').isString().notEmpty().withMessage('Subject name is required'),
  body('subjects.*.proficiency')
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Invalid proficiency level'),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('location.address').isString().notEmpty().withMessage('Address is required'),
  body('location.coordinates.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),
];

export const updateTutorProfileValidation = [
  body('bio').optional().isString().notEmpty().withMessage('Bio must be a non-empty string'),
  body('qualifications').optional().isArray().withMessage('Qualifications must be an array'),
  body('subjects').optional().isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('subjects.*.name').optional().isString().notEmpty().withMessage('Subject name is required'),
  body('subjects.*.proficiency')
    .optional()
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Invalid proficiency level'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('location.address')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Address must be a non-empty string'),
  body('location.coordinates.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),
];

export const searchTutorsValidation = [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').isFloat({ min: 0 }).withMessage('Radius must be a positive number'),
  query('subject').optional().isString().withMessage('Subject must be a string'),
  query('minRate').optional().isFloat({ min: 0 }).withMessage('Min rate must be a positive number'),
  query('maxRate').optional().isFloat({ min: 0 }).withMessage('Max rate must be a positive number'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
];

export const setAvailabilityValidation = [
  body('availability').isArray().withMessage('Availability must be an array'),
  body('availability.*.dayOfWeek')
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be between 0 and 6'),
  body('availability.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('availability.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
];
