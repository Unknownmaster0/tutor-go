'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RatingSummary } from '@/components/review/RatingSummary';
import { ReviewsList } from '@/components/review/ReviewsList';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

interface TutorReviewsData {
  tutorId: string;
  tutorName: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export default function TutorReviewsPage() {
  const params = useParams();
  const tutorId = params.tutorId as string;
  const { user } = useAuth();

  const [reviewsData, setReviewsData] = useState<TutorReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<TutorReviewsData>(`/reviews/tutor/${tutorId}`);

        if (response) {
          setReviewsData(response);
        } else {
          setError('Failed to load reviews');
        }
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError(err.response?.data?.message || 'Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    if (tutorId) {
      fetchReviewsData();
    }
  }, [tutorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error || !reviewsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-600 mb-6">{error || 'Reviews not found'}</p>
          <a
            href="/search"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviews for {reviewsData.tutorName}</h1>
          <p className="text-gray-600 mt-1">See what students are saying about this tutor</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Rating Summary */}
          <div className="lg:col-span-1">
            <RatingSummary
              averageRating={reviewsData.averageRating}
              totalReviews={reviewsData.totalReviews}
              ratingDistribution={reviewsData.ratingDistribution}
            />
          </div>

          {/* Right Column - Reviews List */}
          <div className="lg:col-span-2">
            <ReviewsList
              tutorId={tutorId}
              currentUserId={user?.id}
              onReviewDeleted={() => {
                // Refetch summary on review deletion
                const fetchUpdatedSummary = async () => {
                  try {
                    const response = await apiClient.get<TutorReviewsData>(
                      `/reviews/tutor/${tutorId}`,
                    );
                    if (response) {
                      setReviewsData(response);
                    }
                  } catch (error) {
                    console.error('Failed to fetch updated summary:', error);
                  }
                };
                fetchUpdatedSummary();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
