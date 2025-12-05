import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CancelBookingModal from '@/components/booking/cancel-booking-modal';

describe('CancelBookingModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    bookingId: 'booking-123',
    onConfirm: mockOnConfirm,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title and message', () => {
    render(<CancelBookingModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Cancel Booking' })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel this booking/i)).toBeInTheDocument();
  });

  it('displays reason textarea', () => {
    render(<CancelBookingModal {...defaultProps} />);

    const textarea = screen.getByLabelText(/Reason for cancellation/i);
    expect(textarea).toBeInTheDocument();
  });

  it('allows entering cancellation reason', async () => {
    const user = userEvent.setup();
    render(<CancelBookingModal {...defaultProps} />);

    const textarea = screen.getByLabelText(/Reason for cancellation/i);
    await user.type(textarea, 'Schedule conflict');

    expect(textarea).toHaveValue('Schedule conflict');
  });

  it('calls onClose when Keep Booking button is clicked', async () => {
    const user = userEvent.setup();
    render(<CancelBookingModal {...defaultProps} />);

    const keepButton = screen.getByRole('button', { name: /Keep Booking/i });
    await user.click(keepButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm with booking ID when Cancel Booking button is clicked', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockResolvedValue(undefined);

    render(<CancelBookingModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('booking-123', '');
    });
  });

  it('calls onConfirm with reason when provided', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockResolvedValue(undefined);

    render(<CancelBookingModal {...defaultProps} />);

    const textarea = screen.getByLabelText(/Reason for cancellation/i);
    await user.type(textarea, 'Emergency came up');

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('booking-123', 'Emergency came up');
    });
  });

  it('closes modal after successful cancellation', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockResolvedValue(undefined);

    render(<CancelBookingModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays error message when cancellation fails', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockRejectedValue(new Error('Cancellation failed'));

    render(<CancelBookingModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Cancellation failed')).toBeInTheDocument();
    });
  });

  it('shows loading state during cancellation', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CancelBookingModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Cancelling...')).toBeInTheDocument();
      expect(cancelButton).toBeDisabled();
    });
  });

  it('disables buttons during loading', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockImplementation(() => new Promise(() => {}));

    render(<CancelBookingModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    await waitFor(() => {
      const keepButton = screen.getByRole('button', { name: /Keep Booking/i });
      expect(keepButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  it('does not close modal when cancellation fails', async () => {
    const user = userEvent.setup();
    mockOnConfirm.mockRejectedValue(new Error('Failed'));

    render(<CancelBookingModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
