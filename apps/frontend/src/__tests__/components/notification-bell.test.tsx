import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationBell } from '@/components/notification/notification-bell';
import { Notification } from '@/types/notification.types';

describe('NotificationBell', () => {
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
    {
      id: '3',
      userId: 'user1',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from John',
      read: false,
      createdAt: new Date('2024-01-01T08:00:00Z'),
    },
  ];

  const mockOnMarkAsRead = vi.fn();
  const mockOnMarkAllAsRead = vi.fn();
  const mockOnNotificationClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification bell button', () => {
    render(
      <NotificationBell
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    expect(screen.getByTestId('notification-bell-button')).toBeInTheDocument();
  });

  it('displays unread count badge when there are unread notifications', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const badge = screen.getByTestId('notification-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('2');
  });

  it('displays 99+ when unread count exceeds 99', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={150}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const badge = screen.getByTestId('notification-badge');
    expect(badge).toHaveTextContent('99+');
  });

  it('does not display badge when unread count is 0', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={0}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('opens dropdown when bell button is clicked', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
  });

  it('closes dropdown when bell button is clicked again', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
  });

  it('displays all notifications in the dropdown', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    mockNotifications.forEach((notification) => {
      expect(screen.getByTestId(`notification-item-${notification.id}`)).toBeInTheDocument();
      expect(screen.getByText(notification.title)).toBeInTheDocument();
      expect(screen.getByText(notification.message)).toBeInTheDocument();
    });
  });

  it('displays unread indicator for unread notifications', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    expect(screen.getByTestId('unread-indicator-1')).toBeInTheDocument();
    expect(screen.queryByTestId('unread-indicator-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('unread-indicator-3')).toBeInTheDocument();
  });

  it('highlights unread notifications with different background', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    const unreadNotification = screen.getByTestId('notification-item-1');
    const readNotification = screen.getByTestId('notification-item-2');

    expect(unreadNotification).toHaveClass('bg-blue-50');
    expect(readNotification).not.toHaveClass('bg-blue-50');
  });

  it('calls onMarkAsRead when clicking an unread notification', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onNotificationClick={mockOnNotificationClick}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    const unreadNotification = screen.getByTestId('notification-item-1');
    fireEvent.click(unreadNotification);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
    expect(mockOnNotificationClick).toHaveBeenCalledWith(mockNotifications[0]);
  });

  it('does not call onMarkAsRead when clicking a read notification', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onNotificationClick={mockOnNotificationClick}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    const readNotification = screen.getByTestId('notification-item-2');
    fireEvent.click(readNotification);

    expect(mockOnMarkAsRead).not.toHaveBeenCalled();
    expect(mockOnNotificationClick).toHaveBeenCalledWith(mockNotifications[1]);
  });

  it('calls onMarkAllAsRead when mark all as read button is clicked', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    const markAllButton = screen.getByTestId('mark-all-read-button');
    fireEvent.click(markAllButton);

    expect(mockOnMarkAllAsRead).toHaveBeenCalled();
  });

  it('does not display mark all as read button when unread count is 0', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={0}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    expect(screen.queryByTestId('mark-all-read-button')).not.toBeInTheDocument();
  });

  it('displays empty state when there are no notifications', () => {
    render(
      <NotificationBell
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    expect(screen.getByTestId('no-notifications')).toBeInTheDocument();
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <NotificationBell
          notifications={mockNotifications}
          unreadCount={2}
          onMarkAsRead={mockOnMarkAsRead}
          onMarkAllAsRead={mockOnMarkAllAsRead}
        />
      </div>
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

    const outsideElement = screen.getByTestId('outside-element');
    fireEvent.mouseDown(outsideElement);

    await waitFor(() => {
      expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
    });
  });

  it('displays correct icon for each notification type', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    const notificationItems = screen.getAllByRole('listitem');
    expect(notificationItems[0]).toHaveTextContent('📅'); // booking
    expect(notificationItems[1]).toHaveTextContent('💳'); // payment
    expect(notificationItems[2]).toHaveTextContent('💬'); // message
  });

  it('formats timestamp correctly', () => {
    const now = new Date();
    const recentNotifications: Notification[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'booking',
        title: 'Test',
        message: 'Test message',
        read: false,
        createdAt: new Date(now.getTime() - 30000), // 30 seconds ago
      },
      {
        id: '2',
        userId: 'user1',
        type: 'booking',
        title: 'Test',
        message: 'Test message',
        read: false,
        createdAt: new Date(now.getTime() - 3600000), // 1 hour ago
      },
    ];

    render(
      <NotificationBell
        notifications={recentNotifications}
        unreadCount={2}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    const button = screen.getByTestId('notification-bell-button');
    fireEvent.click(button);

    expect(screen.getByText(/Just now|0m ago/)).toBeInTheDocument();
    expect(screen.getByText('1h ago')).toBeInTheDocument();
  });
});
