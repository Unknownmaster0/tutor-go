import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastContainer, showToast } from '@/components/notification/toast-container';
import { Notification } from '@/types/notification.types';

describe('ToastContainer', () => {
  const mockNotification: Notification = {
    id: '1',
    userId: 'user1',
    type: 'booking',
    title: 'New Booking',
    message: 'You have a new booking request',
    read: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).__addToast;
  });

  it('renders toast container', () => {
    render(<ToastContainer />);

    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('initially renders with no toasts', () => {
    render(<ToastContainer />);

    const container = screen.getByTestId('toast-container');
    expect(container.children).toHaveLength(0);
  });

  it('adds toast when showToast is called', async () => {
    render(<ToastContainer />);

    act(() => {
      showToast(mockNotification);
    });

    await waitFor(() => {
      expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
    });

    expect(screen.getByText('New Booking')).toBeInTheDocument();
  });

  it('adds multiple toasts', async () => {
    render(<ToastContainer />);

    const notification1: Notification = {
      ...mockNotification,
      id: '1',
      title: 'First Toast',
    };

    const notification2: Notification = {
      ...mockNotification,
      id: '2',
      title: 'Second Toast',
    };

    act(() => {
      showToast(notification1);
      showToast(notification2);
    });

    await waitFor(() => {
      expect(screen.getByText('First Toast')).toBeInTheDocument();
      expect(screen.getByText('Second Toast')).toBeInTheDocument();
    });
  });

  it('removes toast after duration', async () => {
    render(<ToastContainer />);

    act(() => {
      showToast(mockNotification);
    });

    await waitFor(() => {
      expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
    });

    // Toast should auto-close after 5 seconds + 300ms animation
    await waitFor(() => {
      expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();
    }, { timeout: 7000 });
  }, 10000);

  it('exposes addToast globally', () => {
    render(<ToastContainer />);

    expect((window as any).__addToast).toBeDefined();
    expect(typeof (window as any).__addToast).toBe('function');
  });

  it('cleans up global addToast on unmount', () => {
    const { unmount } = render(<ToastContainer />);

    expect((window as any).__addToast).toBeDefined();

    unmount();

    expect((window as any).__addToast).toBeUndefined();
  });

  it('handles showToast when window is undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => showToast(mockNotification)).not.toThrow();

    global.window = originalWindow;
  });

  it('handles showToast when __addToast is not defined', () => {
    delete (window as any).__addToast;

    expect(() => showToast(mockNotification)).not.toThrow();
  });
});
