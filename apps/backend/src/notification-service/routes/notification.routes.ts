import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { asyncHandler } from '../../shared';
import {
  getUserNotificationsValidation,
  markAsReadValidation,
  markAsReadParamValidation,
} from '../validators/notification.validator';

/**
 * Create notification routes
 */
export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();

  // GET /notifications/:userId - Get all notifications for a user
  router.get(
    '/:userId',
    getUserNotificationsValidation,
    asyncHandler(controller.getUserNotifications.bind(controller))
  );

  // PATCH /notifications/:id/read - Mark notification as read/unread
  router.patch(
    '/:id/read',
    [...markAsReadParamValidation, ...markAsReadValidation],
    asyncHandler(controller.markAsRead.bind(controller))
  );

  return router;
}
