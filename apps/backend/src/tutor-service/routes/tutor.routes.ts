import { Router } from 'express';
import { TutorController } from '../controllers/tutor.controller';
import { authenticateToken } from '../../auth-service/middleware';
import { asyncHandler } from '../../shared';
import {
  createTutorProfileValidation,
  updateTutorProfileValidation,
  searchTutorsValidation,
  setAvailabilityValidation,
} from '../validators/tutor.validator';
import { upload } from '../middleware/upload.middleware';
import { body } from 'express-validator';

export const createTutorRoutes = (tutorController: TutorController): Router => {
  const router = Router();

  // Public routes
  router.get('/search', searchTutorsValidation, asyncHandler(tutorController.searchTutors));

  // Protected routes - require authentication (must come before /:id routes)
  router.post(
    '/profile',
    authenticateToken,
    createTutorProfileValidation,
    asyncHandler(tutorController.createProfile),
  );
  router.put(
    '/profile',
    authenticateToken,
    updateTutorProfileValidation,
    asyncHandler(tutorController.updateProfile),
  );
  router.get('/profile', authenticateToken, asyncHandler(tutorController.getProfile));
  router.delete('/profile', authenticateToken, asyncHandler(tutorController.deleteProfile));

  // Dynamic ID routes (must come after specific routes)
  router.get('/:id', asyncHandler(tutorController.getProfileById));
  router.get('/:id/availability', asyncHandler(tutorController.getAvailability));

  // Video upload routes
  router.post(
    '/upload-video',
    authenticateToken,
    upload.single('video'),
    asyncHandler(tutorController.uploadVideo),
  );
  router.delete('/delete-video', authenticateToken, asyncHandler(tutorController.deleteVideo));

  // Availability management routes
  router.put(
    '/availability',
    authenticateToken,
    setAvailabilityValidation,
    asyncHandler(tutorController.setAvailability),
  );
  router.post(
    '/availability/slot',
    authenticateToken,
    [
      body('dayOfWeek')
        .isInt({ min: 0, max: 6 })
        .withMessage('Day of week must be between 0 and 6'),
      body('startTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
      body('endTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    ],
    asyncHandler(tutorController.addAvailabilitySlot),
  );
  router.delete(
    '/availability/slot',
    authenticateToken,
    asyncHandler(tutorController.removeAvailabilitySlot),
  );

  return router;
};
