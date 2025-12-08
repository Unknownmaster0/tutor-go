import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentSuccess from '@/components/payment/payment-success';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('PaymentSuccess', () => {
  const defaultProps = {
    bookingId: 'booking-123',
    paymentId: 'pi_123456',
    amount: 75.5,
  };

  it('renders success message', () => {
    render(<PaymentSuccess {...defaultProps} />);

    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    expect(screen.getByText('Your booking has been confirmed')).toBeInTheDocument();
  });

  it('displays booking and payment details', () => {
    render(<PaymentSuccess {...defaultProps} />);

    expect(screen.getByText('booking-123')).toBeInTheDocument();
    expect(screen.getByText('pi_123456')).toBeInTheDocument();
    expect(screen.getByText('$75.50')).toBeInTheDocument();
  });

  it('navigates to booking details when button is clicked', async () => {
    const user = userEvent.setup();
    render(<PaymentSuccess {...defaultProps} />);

    const viewBookingButton = screen.getByRole('button', { name: /View Booking Details/i });
    await user.click(viewBookingButton);

    expect(mockPush).toHaveBeenCalledWith('/booking/booking-123');
  });

  it('navigates to dashboard when button is clicked', async () => {
    const user = userEvent.setup();
    render(<PaymentSuccess {...defaultProps} />);

    const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
    await user.click(dashboardButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('displays success checkmark', () => {
    render(<PaymentSuccess {...defaultProps} />);

    // Check for the checkmark SVG path
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
