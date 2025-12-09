'use client';

import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { RatingStars } from './RatingStars';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface ReviewSubmissionProps {
  bookingId: string;
  tutorId: string;
  tutorName: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export const ReviewSubmission: React.FC<ReviewSubmissionProps> = ({
  bookingId,
  tutorId,
  tutorName,
  onReviewSubmitted,
  onCancel,
}) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const maxCharacters = 500;
  const characterCount = reviewText.length;
  const isValid = rating > 0 && reviewText.trim().length > 0;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (rating < 1 || rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5';
    }

    if (reviewText.trim().length === 0) {
      newErrors.review = 'Please write a review';
    }

    if (reviewText.length > maxCharacters) {
      newErrors.review = `Review must be under ${maxCharacters} characters`;
    }

    if (reviewText.length < 10) {
      newErrors.review = 'Review must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiClient.post('/reviews', {
        bookingId,
        tutorId,
        rating,
        reviewText: reviewText.trim(),
      });

      if (response) {
        toast.success('Review submitted successfully!');
        setRating(5);
        setReviewText('');
        setErrors({});
        onReviewSubmitted?.();
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error: any) {
      console.error('Review submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewChange = (text: string) => {
    if (text.length <= maxCharacters) {
      setReviewText(text);
      if (errors.review) {
        setErrors({ ...errors, review: '' });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close review"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          Share your experience with <strong>{tutorName}</strong>. Your feedback helps other
          students and tutors!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rating <span className="text-red-500">*</span>
          </label>
          <RatingStars
            rating={rating}
            onRatingChange={setRating}
            interactive={true}
            size="lg"
            showLabel={true}
          />
          {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review"
            value={reviewText}
            onChange={(e) => handleReviewChange(e.target.value)}
            placeholder="Share details about your experience. What did you learn? How was the teaching style? Would you recommend this tutor?"
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
              errors.review ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
            }`}
          />
          <div className="flex items-center justify-between mt-2">
            <p
              className={`text-xs ${characterCount > maxCharacters * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}
            >
              {characterCount} / {maxCharacters} characters
            </p>
            {errors.review && <p className="text-red-500 text-sm">{errors.review}</p>}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">💡 Tips for a great review:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Be specific about what you learned or improved</li>
            <li>• Mention the tutor's teaching style and communication</li>
            <li>• Share how the sessions helped you achieve your goals</li>
            <li>• Be honest and constructive in your feedback</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};
