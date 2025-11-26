import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReviewCard } from '@/components/review/review-card';
import { Review } from '@/types/review.types';

describe('ReviewCard', () => {
  const mockReview: Review = {
    id: '1',
    tutorId: 'tutor-123',
    studentId: 'student-456',
    bookingId: 'booking-789',
    studentName: 'John Doe',
    rating: 5,
    comment: 'Excellent tutor! Very patient and knowledgeable.',
    flagged: false,
    createdAt: '2024-01-15T10:00:00Z',
  };

  it('renders student name', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays review comment', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText(/excellent tutor/i)).toBeInTheDocument();
  });

  it('shows correct number of stars for rating', () => {
    render(<ReviewCard review={mockReview} />);

    const stars = document.querySelectorAll('svg');
    const filledStars = Array.from(stars).filter(star => 
      star.classList.contains('text-yellow-400')
    );

    expect(filledStars.length).toBeGreaterThanOrEqual(5);
  });

  it('displays formatted date', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText(/january/i)).toBeInTheDocument();
  });

  it('shows student initial in avatar', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
