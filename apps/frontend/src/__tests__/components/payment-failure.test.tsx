import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentFailure from '@/components/payment/payment-failure';

describe('PaymentFailure', () => {
  const mockOnRetry = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders failure message', () => {
    render(<PaymentFailure error="Card declined" />);

    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText("We couldn't process your payment")).toBeInTheDocument();
  });

  it('displays error details', () => {
    render(<PaymentFailure error="Insufficient funds" />);

    expect(screen.getByText('Error Details:')).toBeInTheDocument();
    expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    render(<PaymentFailure error="Network error" onRetry={mockOnRetry} />);

    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<PaymentFailure error="Network error" />);

    expect(screen.queryByRole('button', { name: /Try Again/i })).not.toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    render(<PaymentFailure error="Network error" onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: /Cancel Booking/i })).toBeInTheDocument();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    render(<PaymentFailure error="Network error" />);

    expect(screen.queryByRole('button', { name: /Cancel Booking/i })).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    render(<PaymentFailure error="Network error" onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /Try Again/i });
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<PaymentFailure error="Network error" onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel Booking/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('displays support message', () => {
    render(<PaymentFailure error="Unknown error" />);

    expect(screen.getByText(/Need help\? Contact our support team/i)).toBeInTheDocument();
  });

  it('displays failure X icon', () => {
    render(<PaymentFailure error="Card declined" />);

    // Check for the X icon SVG
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
