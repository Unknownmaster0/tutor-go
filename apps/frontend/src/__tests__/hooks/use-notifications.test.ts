import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useNotifications } from '@/hooks/use-notifications';
import { apiClient } from '@/lib/api-client';
import { useSocket } from '@/hooks/use-socket';
import { Notification } from '@/types/notification.types';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('@/hooks/use-socket', () => ({
  useSocket: vi.fn(),
}));

describe('useNotifications', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      userId: 'user1',
      type: 'booking',
      title: 'New Booking',
      message: 'You have a new booking request',
      read: false,
      createdAt: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: '2',
      userId: 'user1',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $50 received',
      read: true,
      createdAt: new Date('2024-01-01T09:00:00Z'),
    },
  ];

  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };

  const mockUseSocket = {
    socket: mockSocket,
    isConnected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocket as Mock).mockReturnValue(mockUseSocket);
    (apiClient.get as Mock).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 1,
    });
  });

  it('fetches notifications on mount', async () => {
    const { result } = renderHook(() => useNotifications('user1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/notifications/user1');
    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1);
  });

  it('does not fetch notifications when userId is null', async () => {
    const { result } = renderHook(() => useNotifications(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch';
    (apiClient.get as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('marks notification as read', async () => {
    (apiClient.patch as Mock).mockResolvedValue({});

    const { result } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('1');
    });

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/1/read', { read: true });
    
    const updatedNotification = result.current.notifications.find((n) => n.id === '1');
    expect(updatedNotification?.read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('handles mark as read error', async () => {
    const errorMessage = 'Failed to mark as read';
    (apiClient.patch as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('1');
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('marks all notifications as read', async () => {
    (apiClient.patch as Mock).mockResolvedValue({});

    const { result } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/1/read', { read: true });
    
    result.current.notifications.forEach((notification) => {
      expect(notification.read).toBe(true);
    });
    expect(result.current.unreadCount).toBe(0);
  });

  it('does not mark all as read when userId is null', async () => {
    const { result } = renderHook(() => useNotifications(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('handles real-time new notification event', async () => {
    let notificationHandler: ((notification: Notification) => void) | null = null;

    mockUseSocket.on.mockImplementation((event: string, handler: any) => {
      if (event === 'notification:new') {
        notificationHandler = handler;
      }
    });

    const { result } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newNotification: Notification = {
      id: '3',
      userId: 'user1',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message',
      read: false,
      createdAt: new Date(),
    };

    act(() => {
      notificationHandler?.(newNotification);
    });

    expect(result.current.notifications[0]).toEqual(newNotification);
    expect(result.current.unreadCount).toBe(2);
  });

  it('handles real-time notification read event', async () => {
    let readHandler: ((data: { notificationId: string }) => void) | null = null;

    mockUseSocket.on.mockImplementation((event: string, handler: any) => {
      if (event === 'notification:read') {
        readHandler = handler;
      }
    });

    const { result } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      readHandler?.({ notificationId: '1' });
    });

    const updatedNotification = result.current.notifications.find((n) => n.id === '1');
    expect(updatedNotification?.read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('refetches notifications', async () => {
    const { result } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('connects to socket when userId is provided', () => {
    renderHook(() => useNotifications('user1'));

    expect(useSocket).toHaveBeenCalledWith(
      expect.objectContaining({
        autoConnect: true,
      })
    );
  });

  it('does not connect to socket when userId is null', () => {
    renderHook(() => useNotifications(null));

    expect(useSocket).toHaveBeenCalledWith(
      expect.objectContaining({
        autoConnect: false,
      })
    );
  });

  it('cleans up socket listeners on unmount', async () => {
    const { unmount } = renderHook(() => useNotifications('user1'));

    await waitFor(() => {
      expect(mockUseSocket.on).toHaveBeenCalled();
    });

    unmount();

    expect(mockUseSocket.off).toHaveBeenCalledWith('notification:new', expect.any(Function));
    expect(mockUseSocket.off).toHaveBeenCalledWith('notification:read', expect.any(Function));
  });
});
