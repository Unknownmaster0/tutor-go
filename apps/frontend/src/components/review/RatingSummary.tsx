'use client';

import { RatingStars } from './RatingStars';

interface RatingSummaryProps {
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

export const RatingSummary: React.FC<RatingSummaryProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution,
}) => {
  const total =
    ratingDistribution.fiveStar +
    ratingDistribution.fourStar +
    ratingDistribution.threeStar +
    ratingDistribution.twoStar +
    ratingDistribution.oneStar;

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const ratingBars = [
    { stars: 5, count: ratingDistribution.fiveStar },
    { stars: 4, count: ratingDistribution.fourStar },
    { stars: 3, count: ratingDistribution.threeStar },
    { stars: 2, count: ratingDistribution.twoStar },
    { stars: 1, count: ratingDistribution.oneStar },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Ratings & Reviews</h3>

      {/* Overall Rating */}
      <div className="flex items-start gap-8">
        {/* Big Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
          <RatingStars rating={Math.round(averageRating)} interactive={false} size="md" />
          <p className="text-sm text-gray-600 mt-2">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Bars */}
        <div className="flex-1 space-y-3">
          {ratingBars.map(({ stars, count }) => {
            const percentage = getPercentage(count);
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-12">
                  {stars} <span className="text-yellow-400">★</span>
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {totalReviews === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
};
