'use client';

import { useState } from 'react';
import { StarRating } from './star-rating';
import { apiClient } from '@/lib/api-client';
import { ReviewFormData, ReviewSubmissionResponse } from '@/types/review.types';

interface ReviewSubmissionFormProps {
  bookingId: string;
  tutorId: string;
  tutorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ReviewSubmissionForm({
  bookingId,
  tutorId,
  tutorName,
  onSuccess,
  onCancel,
  className = '',
}: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    rating?: string;
    comment?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      errors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      errors.comment = 'Please provide a comment';
    } else if (comment.trim().length < 10) {
      errors.comment = 'Comment must be at least 10 characters';
    } else if (comment.trim().length > 1000) {
      errors.comment = 'Comment must not exceed 1000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: ReviewFormData = {
        bookingId,
        tutorId,
        rating,
        comment: comment.trim(),
      };

      await apiClient.post<ReviewSubmissionResponse>('/reviews', formData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h2>
      <p className="text-gray-600 mb-6">
        Share your experience with {tutorName}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
            className="mb-1"
          />
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
          {validationErrors.rating && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.rating}</p>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Tell us about your experience with this tutor..."
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            <div>
              {validationErrors.comment && (
                <p className="text-sm text-red-600">{validationErrors.comment}</p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {comment.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
