import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentForm from '@/components/payment/payment-form';

// Mock Stripe hooks
const mockConfirmPayment = vi.fn();
const mockSubmit = vi.fn();

vi.mock('@stripe/react-stripe-js', () => ({
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  useStripe: () => ({
    confirmPayment: mockConfirmPayment,
  }),
  useElements: () => ({
    submit: mockSubmit,
  }),
}));

describe('PaymentForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    bookingId: 'booking-123',
    amount: 50,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment form with amount', () => {
    render(<PaymentForm {...defaultProps} />);

    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
  });

  it('displays security notice', () => {
    render(<PaymentForm {...defaultProps} />);

    expect(
      screen.getByText(/Your payment information is secure and encrypted/i),
    ).toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    render(<PaymentForm {...defaultProps} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    render(<PaymentForm {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...defaultProps} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles successful payment', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValue({ error: null });
    mockConfirmPayment.mockResolvedValue({
      error: null,
      paymentIntent: { id: 'pi_123', status: 'succeeded' },
    });

    render(<PaymentForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Pay \$50.00/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(mockConfirmPayment).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalledWith('pi_123');
    });
  });

  it('handles payment submission error', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValue({ error: { message: 'Invalid card details' } });

    render(<PaymentForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Pay \$50.00/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid card details')).toBeInTheDocument();
    });
  });

  it('handles payment confirmation error', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValue({ error: null });
    mockConfirmPayment.mockResolvedValue({
      error: { message: 'Payment declined' },
      paymentIntent: null,
    });

    render(<PaymentForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Pay \$50.00/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Payment declined')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Payment declined');
    });
  });

  it('shows loading state during payment processing', async () => {
    const user = userEvent.setup();
    mockSubmit.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PaymentForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Pay \$50.00/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('disables submit button during loading', async () => {
    const user = userEvent.setup();
    mockSubmit.mockImplementation(() => new Promise(() => {}));

    render(<PaymentForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Pay \$50.00/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('handles unexpected errors gracefully', async () => {
    const user = userEvent.setup();
    mockSubmit.mockRejectedValue(new Error('Network error'));

    render(<PaymentForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Pay \$50.00/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Network error');
    });
  });

  it('clears error message on new submission', async () => {
    const user = userEvent.setup();
    mockSubmit.mockResolvedValueOnce({ error: { message: 'First error' } });

    render(<PaymentForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /Pay \$50.00/i });

    // First submission with error
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second submission should clear the error
    mockSubmit.mockResolvedValueOnce({ error: null });
    mockConfirmPayment.mockResolvedValueOnce({
      error: null,
      paymentIntent: { id: 'pi_123', status: 'succeeded' },
    });

    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });
});
