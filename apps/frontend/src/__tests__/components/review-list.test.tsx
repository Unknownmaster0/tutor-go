import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewList } from '@/components/review/review-list';
import { apiClient } from '@/lib/api-client';
import { vi } from 'vitest';

vi.mock('@/lib/api-client');

describe('ReviewList', () => {
  const mockReviewsResponse = {
    reviews: [
      {
        id: '1',
        tutorId: 'tutor-123',
        studentId: 'student-1',
        bookingId: 'booking-1',
        studentName: 'John Doe',
        rating: 5,
        comment: 'Excellent tutor!',
        flagged: false,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        tutorId: 'tutor-123',
        studentId: 'student-2',
        bookingId: 'booking-2',
        studentName: 'Jane Smith',
        rating: 4,
        comment: 'Very helpful and patient.',
        flagged: false,
        createdAt: '2024-01-14T10:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    limit: 10,
    averageRating: 4.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  it('displays loading state initially', () => {
    (apiClient.get as any).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<ReviewList tutorId="tutor-123" />);
    
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('displays reviews after loading', async () => {
    (apiClient.get as any).mockResolvedValue(mockReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays average rating prominently', async () => {
    (apiClient.get as any).mockResolvedValue(mockReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText(/Based on 2 reviews/i)).toBeInTheDocument();
    });
  });

  it('displays correct singular/plural for review count', async () => {
    const singleReviewResponse = {
      ...mockReviewsResponse,
      reviews: [mockReviewsResponse.reviews[0]],
      total: 1,
      averageRating: 5,
    };
    
    (apiClient.get as any).mockResolvedValue(singleReviewResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Based on 1 review/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no reviews', async () => {
    (apiClient.get as any).mockResolvedValue({
      reviews: [],
      total: 0,
      page: 1,
      limit: 10,
      averageRating: 0,
    });
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('No reviews yet')).toBeInTheDocument();
      expect(screen.getByText(/Be the first to review/i)).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    (apiClient.get as any).mockRejectedValue({
      response: {
        data: {
          message: 'Failed to fetch reviews',
        },
      },
    });
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reviews')).toBeInTheDocument();
    });
  });

  it('shows pagination when there are multiple pages', async () => {
    const manyReviewsResponse = {
      ...mockReviewsResponse,
      total: 25,
    };
    
    (apiClient.get as any).mockResolvedValue(manyReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    });
  });

  it('does not show pagination when there is only one page', async () => {
    (apiClient.get as any).mockResolvedValue(mockReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
    });
  });

  it('disables previous button on first page', async () => {
    const manyReviewsResponse = {
      ...mockReviewsResponse,
      total: 25,
    };
    
    (apiClient.get as any).mockResolvedValue(manyReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /Previous/i });
      expect(prevButton).toBeDisabled();
    });
  });

  it('changes page when next button is clicked', async () => {
    const manyReviewsResponse = {
      ...mockReviewsResponse,
      total: 25,
    };
    
    (apiClient.get as any).mockResolvedValue(manyReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/reviews/tutor/tutor-123?page=2&limit=10'
      );
    });
  });

  it('changes page when page number is clicked', async () => {
    const manyReviewsResponse = {
      ...mockReviewsResponse,
      total: 25,
    };
    
    (apiClient.get as any).mockResolvedValue(manyReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/reviews/tutor/tutor-123?page=2&limit=10'
      );
    });
  });

  it('highlights current page in pagination', async () => {
    const manyReviewsResponse = {
      ...mockReviewsResponse,
      total: 25,
    };
    
    (apiClient.get as any).mockResolvedValue(manyReviewsResponse);
    
    render(<ReviewList tutorId="tutor-123" />);
    
    await waitFor(() => {
      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).toHaveClass('bg-purple-600');
    });
  });

  it('fetches reviews with correct tutor ID', async () => {
    (apiClient.get as any).mockResolvedValue(mockReviewsResponse);
    
    render(<ReviewList tutorId="tutor-456" />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/reviews/tutor/tutor-456?page=1&limit=10'
      );
    });
  });
});
