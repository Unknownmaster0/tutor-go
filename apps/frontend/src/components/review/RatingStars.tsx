'use client';

import { Star } from 'lucide-react';
import React from 'react';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  interactive = false,
  size = 'md',
  showLabel = false,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeMap = {
    sm: { star: 'w-4 h-4', gap: 'gap-1' },
    md: { star: 'w-5 h-5', gap: 'gap-2' },
    lg: { star: 'w-8 h-8', gap: 'gap-2' },
  };

  const { star: starSize, gap } = sizeMap[size];

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleStarClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleStarHover = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const getRatingLabel = (val: number) => {
    const labels: { [key: number]: string } = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return labels[val] || '';
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex ${gap} ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={!interactive}
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`${starSize} ${
                star <= displayRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {displayRating > 0 ? getRatingLabel(displayRating) : 'No rating'}
        </span>
      )}
    </div>
  );
};
