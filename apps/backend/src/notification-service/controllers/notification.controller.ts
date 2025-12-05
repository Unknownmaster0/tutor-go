import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../../shared';

/**
 * Notification Controller
 * Handles HTTP requests for notification endpoints
 */
export class NotificationController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * GET /notifications/:userId
   * Get all notifications for a user
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ApiResponse.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { userId } = req.params;

    const notifications = await this.notificationService.getUserNotifications(userId);

    ApiResponse.success(res, notifications, 'Notifications retrieved successfully');
  }

  /**
   * PATCH /notifications/:id/read
   * Mark a notification as read or unread
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ApiResponse.error(res, 'Validation failed', 400, errors.array());
      return;
    }

    const { id } = req.params;
    const { read } = req.body;

    const notification = await this.notificationService.markAsRead(id, read);

    ApiResponse.success(res, notification, 'Notification updated successfully');
  }
}
