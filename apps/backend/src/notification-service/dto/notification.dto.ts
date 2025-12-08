/**
 * Data Transfer Objects for Notification Service
 */

export interface CreateNotificationDto {
  userId: string;
  type: 'booking' | 'payment' | 'message' | 'review';
  title: string;
  message: string;
  metadata?: any;
}

export interface NotificationResponseDto {
  id: string;
  userId: string;
  type: 'booking' | 'payment' | 'message' | 'review';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: any;
}

export interface MarkAsReadDto {
  read: boolean;
}
