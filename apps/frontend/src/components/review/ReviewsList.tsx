'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface Review {
  id: string;
  studentId: string;
  studentName: string;
  studentImage?: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  isOwner?: boolean;
}

interface ReviewsListProps {
  tutorId: string;
  currentUserId?: string;
  onReviewDeleted?: () => void;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export const ReviewsList: React.FC<ReviewsListProps> = ({
  tutorId,
  currentUserId,
  onReviewDeleted,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<Review[]>(`/api/review/tutor/${tutorId}`);

        if (response) {
          const reviewList = response || [];
          const reviewsWithOwnerFlag = reviewList.map((review: Review) => ({
            ...review,
            isOwner: review.studentId === currentUserId,
          }));
          setReviews(reviewsWithOwnerFlag);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load reviews');
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [tutorId, currentUserId]);

  const sortReviews = (reviewList: Review[], option: SortOption) => {
    const sorted = [...reviewList];

    switch (option) {
      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case 'oldest':
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  const handleReviewDeleted = () => {
    // Fetch reviews again to update the list
    const fetchUpdatedReviews = async () => {
      try {
        const response = await apiClient.get<Review[]>(`/api/review/tutor/${tutorId}`);
        if (response) {
          const reviewList = response || [];
          const reviewsWithOwnerFlag = reviewList.map((review: Review) => ({
            ...review,
            isOwner: review.studentId === currentUserId,
          }));
          setReviews(reviewsWithOwnerFlag);
        }
      } catch (error: any) {
        console.error('Failed to fetch updated reviews:', error);
      }
    };

    fetchUpdatedReviews();
    onReviewDeleted?.();
  };

  // Filter and sort reviews
  const filteredReviews =
    filterRating === 'all' ? reviews : reviews.filter((r) => r.rating === filterRating);

  const sortedReviews = sortReviews(filteredReviews, sortBy);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-center text-gray-600 text-sm">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">This tutor hasn't received any reviews yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters & Sort */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterRating === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterRating === rating
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating} ★
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Showing {sortedReviews.length} of {reviews.length} reviews
        </p>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            studentName={review.studentName}
            studentImage={review.studentImage}
            rating={review.rating}
            reviewText={review.reviewText}
            createdAt={review.createdAt}
            isOwner={review.isOwner}
            canDelete={review.isOwner}
            onReviewDeleted={handleReviewDeleted}
          />
        ))}
      </div>

      {/* Empty Filter State */}
      {sortedReviews.length === 0 && filterRating !== 'all' && (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-600 text-sm">No reviews with this rating</p>
        </div>
      )}
    </div>
  );
};
