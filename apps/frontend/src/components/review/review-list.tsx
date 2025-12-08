'use client';

import { useState, useEffect } from 'react';
import { ReviewCard } from './review-card';
import { StarRating } from './star-rating';
import { apiClient } from '@/lib/api-client';
import { ReviewListResponse } from '@/types/review.types';

interface ReviewListProps {
  tutorId: string;
  className?: string;
}

export function ReviewList({ tutorId, className = '' }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    fetchReviews();
  }, [tutorId, currentPage]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<ReviewListResponse>(
        `/reviews/tutor/${tutorId}?page=${currentPage}&limit=${limit}`
      );
      setReviews(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = reviews ? Math.ceil(reviews.total / limit) : 0;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.reviews.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="mt-4 text-gray-600">No reviews yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Be the first to review this tutor!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header with Average Rating */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {reviews.averageRating.toFixed(1)}
            </span>
            <div>
              <StarRating rating={Math.round(reviews.averageRating)} readonly size="md" />
              <p className="text-sm text-gray-600 mt-1">
                Based on {reviews.total} {reviews.total === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!showPage) {
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
