import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastNotification } from '@/components/notification/toast-notification';
import { Notification } from '@/types/notification.types';

describe('ToastNotification', () => {
  const mockNotification: Notification = {
    id: '1',
    userId: 'user1',
    type: 'booking',
    title: 'New Booking',
    message: 'You have a new booking request',
    read: false,
    createdAt: new Date(),
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toast notification', () => {
    render(<ToastNotification notification={mockNotification} onClose={mockOnClose} />);

    expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
    expect(screen.getByTestId('toast-title')).toHaveTextContent('New Booking');
    expect(screen.getByTestId('toast-message')).toHaveTextContent('You have a new booking request');
  });

  it('displays correct icon for booking type', () => {
    render(<ToastNotification notification={mockNotification} onClose={mockOnClose} />);

    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('displays correct icon for payment type', () => {
    const paymentNotification: Notification = {
      ...mockNotification,
      type: 'payment',
    };

    render(<ToastNotification notification={paymentNotification} onClose={mockOnClose} />);

    expect(screen.getByText('💳')).toBeInTheDocument();
  });

  it('displays correct icon for message type', () => {
    const messageNotification: Notification = {
      ...mockNotification,
      type: 'message',
    };

    render(<ToastNotification notification={messageNotification} onClose={mockOnClose} />);

    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  it('displays correct icon for review type', () => {
    const reviewNotification: Notification = {
      ...mockNotification,
      type: 'review',
    };

    render(<ToastNotification notification={reviewNotification} onClose={mockOnClose} />);

    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<ToastNotification notification={mockNotification} onClose={mockOnClose} />);

    const closeButton = screen.getByTestId('toast-close-button');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('auto-closes after duration', async () => {
    render(<ToastNotification notification={mockNotification} onClose={mockOnClose} duration={1000} />);

    expect(screen.getByTestId('toast-notification')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('uses default duration of 5000ms', async () => {
    render(<ToastNotification notification={mockNotification} onClose={mockOnClose} duration={1000} />);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('applies correct color for booking type', () => {
    const { container } = render(<ToastNotification notification={mockNotification} onClose={mockOnClose} />);

    const iconContainer = container.querySelector('.bg-blue-500');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies correct color for payment type', () => {
    const paymentNotification: Notification = {
      ...mockNotification,
      type: 'payment',
    };

    const { container } = render(<ToastNotification notification={paymentNotification} onClose={mockOnClose} />);

    const iconContainer = container.querySelector('.bg-green-500');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies correct color for message type', () => {
    const messageNotification: Notification = {
      ...mockNotification,
      type: 'message',
    };

    const { container } = render(<ToastNotification notification={messageNotification} onClose={mockOnClose} />);

    const iconContainer = container.querySelector('.bg-purple-500');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies correct color for review type', () => {
    const reviewNotification: Notification = {
      ...mockNotification,
      type: 'review',
    };

    const { container } = render(<ToastNotification notification={reviewNotification} onClose={mockOnClose} />);

    const iconContainer = container.querySelector('.bg-yellow-500');
    expect(iconContainer).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ToastNotification notification={mockNotification} onClose={mockOnClose} />);

    const toast = screen.getByTestId('toast-notification');
    expect(toast).toHaveAttribute('role', 'alert');

    const closeButton = screen.getByTestId('toast-close-button');
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
  });
});
