import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './use-socket';
import { apiClient } from '@/lib/api-client';
import { Notification } from '@/types/notification.types';

const NOTIFICATION_SERVICE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:8007';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotifications = (userId: string | null): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { socket, isConnected, on, off } = useSocket({
    url: NOTIFICATION_SERVICE_URL,
    autoConnect: !!userId,
    onConnect: () => {
      console.log('Connected to notification service');
    },
    onDisconnect: (reason) => {
      console.log('Disconnected from notification service:', reason);
    },
    onError: (error) => {
      console.error('Notification socket error:', error);
      setError(error.message);
    },
  });

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<{ notifications: Notification[]; unreadCount: number }>(
        `/notifications/${userId}`,
      );

      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`, { read: true });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.read);

      await Promise.all(
        unreadNotifications.map((notification) =>
          apiClient.patch(`/notifications/${notification.id}/read`, { read: true }),
        ),
      );

      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));

      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err.message || 'Failed to mark all notifications as read');
    }
  }, [userId, notifications]);

  // Handle real-time notification events
  useEffect(() => {
    if (!isConnected || !socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleNotificationRead = (data: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === data.notificationId ? { ...notification, read: true } : notification,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    on('notification:new', handleNewNotification);
    on('notification:read', handleNotificationRead);

    return () => {
      off('notification:new', handleNewNotification);
      off('notification:read', handleNotificationRead);
    };
  }, [isConnected, socket, on, off]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
