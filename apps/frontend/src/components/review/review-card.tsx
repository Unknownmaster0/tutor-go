'use client';

import { Review } from '@/types/review.types';
import { StarRating } from './star-rating';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className = '' }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{review.studentName}</h4>
            <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
}
