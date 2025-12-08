import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../../auth-service/middleware/auth.middleware';
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

  // GET /notifications/:userId - Get all notifications for a user (authenticated)
  router.get(
    '/:userId',
    authenticateToken,
    getUserNotificationsValidation,
    asyncHandler(controller.getUserNotifications.bind(controller)),
  );

  // PATCH /notifications/:id/read - Mark notification as read/unread (authenticated)
  router.patch(
    '/:id/read',
    authenticateToken,
    [...markAsReadParamValidation, ...markAsReadValidation],
    asyncHandler(controller.markAsRead.bind(controller)),
  );

  return router;
}
