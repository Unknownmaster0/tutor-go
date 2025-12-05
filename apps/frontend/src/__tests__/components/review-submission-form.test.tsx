import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewSubmissionForm } from '@/components/review/review-submission-form';
import { apiClient } from '@/lib/api-client';
import { vi } from 'vitest';

vi.mock('@/lib/api-client');

describe('ReviewSubmissionForm', () => {
  const mockProps = {
    bookingId: 'booking-123',
    tutorId: 'tutor-456',
    tutorName: 'John Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with tutor name', () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.getByText(/Share your experience with John Doe/i)).toBeInTheDocument();
  });

  it('displays star rating component', () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    expect(stars).toHaveLength(5);
  });

  it('displays comment textarea', () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText(/Tell us about your experience/i);
    expect(textarea).toBeInTheDocument();
  });

  it('shows validation error when rating is not selected', async () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please select a rating')).toBeInTheDocument();
    });
  });

  it('shows validation error when comment is empty', async () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    fireEvent.click(stars[3]); // Select 4 stars
    
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please provide a comment')).toBeInTheDocument();
    });
  });

  it('shows validation error when comment is too short', async () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    fireEvent.click(stars[3]);
    
    const textarea = screen.getByPlaceholderText(/Tell us about your experience/i);
    fireEvent.change(textarea, { target: { value: 'Short' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Comment must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('shows validation error when comment is too long', async () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    fireEvent.click(stars[3]);
    
    const longComment = 'a'.repeat(1001);
    const textarea = screen.getByPlaceholderText(/Tell us about your experience/i);
    fireEvent.change(textarea, { target: { value: longComment } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Comment must not exceed 1000 characters')).toBeInTheDocument();
    });
  });

  it('displays character count', () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText(/Tell us about your experience/i);
    fireEvent.change(textarea, { target: { value: 'Great tutor!' } });
    
    expect(screen.getByText('12/1000 characters')).toBeInTheDocument();
  });

  it('displays rating description when rating is selected', () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    
    fireEvent.click(stars[0]);
    expect(screen.getByText('Poor')).toBeInTheDocument();
    
    fireEvent.click(stars[1]);
    expect(screen.getByText('Fair')).toBeInTheDocument();
    
    fireEvent.click(stars[2]);
    expect(screen.getByText('Good')).toBeInTheDocument();
    
    fireEvent.click(stars[3]);
    expect(screen.getByText('Very Good')).toBeInTheDocument();
    
    fireEvent.click(stars[4]);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const mockOnSuccess = vi.fn();
    (apiClient.post as any).mockResolvedValue({
      review: {
        id: 'review-123',
        rating: 5,
        comment: 'Excellent tutor!',
      },
      message: 'Review submitted successfully',
    });

    render(<ReviewSubmissionForm {...mockProps} onSuccess={mockOnSuccess} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    fireEvent.click(stars[4]); // 5 stars
    
    const textarea = screen.getByPlaceholderText(/Tell us about your experience/i);
    fireEvent.change(textarea, { target: { value: 'Excellent tutor! Very helpful.' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/reviews', {
        bookingId: 'booking-123',
        tutorId: 'tutor-456',
        rating: 5,
        comment: 'Excellent tutor! Very helpful.',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message on submission failure', async () => {
    (apiClient.post as any).mockRejectedValue({
      response: {
        data: {
          message: 'You have already reviewed this booking',
        },
      },
    });

    render(<ReviewSubmissionForm {...mockProps} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    fireEvent.click(stars[4]);
    
    const textarea = screen.getByPlaceholderText(/Tell us about your experience/i);
    fireEvent.change(textarea, { target: { value: 'Great experience!' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('You have already reviewed this booking')).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    (apiClient.post as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ReviewSubmissionForm {...mockProps} />);
    
    const stars = screen.getAllByRole('button', { name: /Rate \d stars/i });
    fireEvent.click(stars[4]);
    
    const textarea = screen.getByPlaceholderText(/Tell us about your experience/i);
    fireEvent.change(textarea, { target: { value: 'Great experience!' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(textarea).toBeDisabled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = vi.fn();
    render(<ReviewSubmissionForm {...mockProps} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not render cancel button when onCancel is not provided', () => {
    render(<ReviewSubmissionForm {...mockProps} />);
    
    const cancelButton = screen.queryByRole('button', { name: /Cancel/i });
    expect(cancelButton).not.toBeInTheDocument();
  });
});
