export type NotificationType = 'booking' | 'payment' | 'message' | 'review';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: any;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}
