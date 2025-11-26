import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '@/components/review/star-rating';
import { vi } from 'vitest';

describe('StarRating', () => {
  it('renders 5 stars', () => {
    render(<StarRating rating={0} />);
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('displays the correct rating', () => {
    const { container } = render(<StarRating rating={3} />);
    const filledStars = container.querySelectorAll('.text-yellow-400');
    expect(filledStars).toHaveLength(3);
  });

  it('calls onRatingChange when a star is clicked', () => {
    const handleRatingChange = vi.fn();
    render(<StarRating rating={0} onRatingChange={handleRatingChange} />);
    
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[3]); // Click 4th star (index 3)
    
    expect(handleRatingChange).toHaveBeenCalledWith(4);
  });

  it('does not call onRatingChange when readonly', () => {
    const handleRatingChange = vi.fn();
    render(<StarRating rating={3} onRatingChange={handleRatingChange} readonly />);
    
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[4]);
    
    expect(handleRatingChange).not.toHaveBeenCalled();
  });

  it('shows hover effect on mouse enter', () => {
    const { container } = render(<StarRating rating={2} onRatingChange={() => {}} />);
    const stars = screen.getAllByRole('button');
    
    fireEvent.mouseEnter(stars[3]); // Hover over 4th star
    
    const filledStars = container.querySelectorAll('.text-yellow-400');
    expect(filledStars).toHaveLength(4);
  });

  it('resets to original rating on mouse leave', () => {
    const { container } = render(<StarRating rating={2} onRatingChange={() => {}} />);
    const stars = screen.getAllByRole('button');
    
    fireEvent.mouseEnter(stars[3]);
    fireEvent.mouseLeave(stars[3]);
    
    const filledStars = container.querySelectorAll('.text-yellow-400');
    expect(filledStars).toHaveLength(2);
  });

  it('applies correct size classes', () => {
    const { container: smallContainer } = render(<StarRating rating={3} size="sm" />);
    const { container: mediumContainer } = render(<StarRating rating={3} size="md" />);
    const { container: largeContainer } = render(<StarRating rating={3} size="lg" />);
    
    expect(smallContainer.querySelector('.w-4')).toBeInTheDocument();
    expect(mediumContainer.querySelector('.w-6')).toBeInTheDocument();
    expect(largeContainer.querySelector('.w-8')).toBeInTheDocument();
  });

  it('has proper aria labels', () => {
    render(<StarRating rating={0} />);
    
    expect(screen.getByLabelText('Rate 1 stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 5 stars')).toBeInTheDocument();
  });

  it('disables interaction when readonly', () => {
    render(<StarRating rating={3} readonly />);
    const stars = screen.getAllByRole('button');
    
    stars.forEach(star => {
      expect(star).toBeDisabled();
    });
  });
});
