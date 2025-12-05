import { ReviewService } from '../services/review.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  review: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Review Retrieval', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('GET /reviews/tutor/:tutorId', () => {
    const tutorId = 'tutor-123';

    const mockReviews = [
      {
        id: 'review-1',
        tutorId,
        studentId: 'student-1',
        bookingId: 'booking-1',
        rating: 5,
        comment: 'Excellent tutor! Very knowledgeable.',
        flagged: false,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'review-2',
        tutorId,
        studentId: 'student-2',
        bookingId: 'booking-2',
        rating: 4,
        comment: 'Good session, learned a lot.',
        flagged: false,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: 'review-3',
        tutorId,
        studentId: 'student-3',
        bookingId: 'booking-3',
        rating: 5,
        comment: 'Amazing experience!',
        flagged: false,
        createdAt: new Date('2024-01-05'),
      },
    ];

    it('should retrieve reviews sorted by most recent first', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(3);

      const result = await reviewService.getReviewsByTutorId(tutorId);

      expect(result.reviews).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
        where: { tutorId, flagged: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should support pagination with limit', async () => {
      const limitedReviews = mockReviews.slice(0, 2);
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(limitedReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(3);

      const result = await reviewService.getReviewsByTutorId(tutorId, {
        limit: 2,
        offset: 0,
      });

      expect(result.reviews).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
        where: { tutorId, flagged: false },
        orderBy: { createdAt: 'desc' },
        take: 2,
        skip: 0,
      });
    });

    it('should support pagination with offset', async () => {
      const offsetReviews = [mockReviews[2]];
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(offsetReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(3);

      const result = await reviewService.getReviewsByTutorId(tutorId, {
        limit: 10,
        offset: 2,
      });

      expect(result.reviews).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
        where: { tutorId, flagged: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 2,
      });
    });

    it('should exclude flagged reviews by default', async () => {
      const nonFlaggedReviews = mockReviews.filter((r) => !r.flagged);
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(nonFlaggedReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(nonFlaggedReviews.length);

      await reviewService.getReviewsByTutorId(tutorId);

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tutorId, flagged: false },
        })
      );
    });

    it('should return empty array when no reviews exist', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(0);

      const result = await reviewService.getReviewsByTutorId('tutor-no-reviews');

      expect(result.reviews).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle large offset gracefully', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(3);

      const result = await reviewService.getReviewsByTutorId(tutorId, {
        limit: 10,
        offset: 100,
      });

      expect(result.reviews).toHaveLength(0);
      expect(result.total).toBe(3);
    });

    it('should return reviews with all required fields', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([mockReviews[0]]);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(1);

      const result = await reviewService.getReviewsByTutorId(tutorId);

      const review = result.reviews[0];
      expect(review).toHaveProperty('id');
      expect(review).toHaveProperty('tutorId');
      expect(review).toHaveProperty('studentId');
      expect(review).toHaveProperty('bookingId');
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('comment');
      expect(review).toHaveProperty('flagged');
      expect(review).toHaveProperty('createdAt');
    });

    it('should handle reviews without comments', async () => {
      const reviewWithoutComment = {
        ...mockReviews[0],
        comment: null,
      };

      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([reviewWithoutComment]);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(1);

      const result = await reviewService.getReviewsByTutorId(tutorId);

      expect(result.reviews[0].comment).toBeNull();
    });

    it('should use default limit of 10 when not specified', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(3);

      await reviewService.getReviewsByTutorId(tutorId);

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should use default offset of 0 when not specified', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(3);

      await reviewService.getReviewsByTutorId(tutorId);

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
        })
      );
    });
  });
});
