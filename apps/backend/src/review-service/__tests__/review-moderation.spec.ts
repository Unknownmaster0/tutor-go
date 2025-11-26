import { ReviewService } from '../services/review.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  review: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Review Moderation', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('flagReview', () => {
    const mockReview = {
      id: 'review-123',
      tutorId: 'tutor-123',
      studentId: 'student-456',
      bookingId: 'booking-789',
      rating: 1,
      comment: 'Inappropriate content',
      flagged: false,
      createdAt: new Date(),
    };

    it('should flag a review for moderation', async () => {
      const flaggedReview = { ...mockReview, flagged: true };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (mockPrisma.review.update as jest.Mock).mockResolvedValue(flaggedReview);

      const result = await reviewService.flagReview('review-123', true);

      expect(result.flagged).toBe(true);
      expect(mockPrisma.review.findUnique).toHaveBeenCalledWith({
        where: { id: 'review-123' },
      });
      expect(mockPrisma.review.update).toHaveBeenCalledWith({
        where: { id: 'review-123' },
        data: { flagged: true },
      });
    });

    it('should unflag a previously flagged review', async () => {
      const flaggedReview = { ...mockReview, flagged: true };
      const unflaggedReview = { ...mockReview, flagged: false };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(flaggedReview);
      (mockPrisma.review.update as jest.Mock).mockResolvedValue(unflaggedReview);

      const result = await reviewService.flagReview('review-123', false);

      expect(result.flagged).toBe(false);
      expect(mockPrisma.review.update).toHaveBeenCalledWith({
        where: { id: 'review-123' },
        data: { flagged: false },
      });
    });

    it('should throw error when review not found', async () => {
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.flagReview('non-existent', true)).rejects.toThrow(
        'Review not found'
      );

      expect(mockPrisma.review.update).not.toHaveBeenCalled();
    });

    it('should allow flagging an already flagged review', async () => {
      const flaggedReview = { ...mockReview, flagged: true };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(flaggedReview);
      (mockPrisma.review.update as jest.Mock).mockResolvedValue(flaggedReview);

      const result = await reviewService.flagReview('review-123', true);

      expect(result.flagged).toBe(true);
      expect(mockPrisma.review.update).toHaveBeenCalled();
    });

    it('should allow unflagging an already unflagged review', async () => {
      const unflaggedReview = { ...mockReview, flagged: false };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(unflaggedReview);
      (mockPrisma.review.update as jest.Mock).mockResolvedValue(unflaggedReview);

      const result = await reviewService.flagReview('review-123', false);

      expect(result.flagged).toBe(false);
      expect(mockPrisma.review.update).toHaveBeenCalled();
    });

    it('should preserve all review data when flagging', async () => {
      const flaggedReview = { ...mockReview, flagged: true };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (mockPrisma.review.update as jest.Mock).mockResolvedValue(flaggedReview);

      const result = await reviewService.flagReview('review-123', true);

      expect(result.id).toBe(mockReview.id);
      expect(result.tutorId).toBe(mockReview.tutorId);
      expect(result.studentId).toBe(mockReview.studentId);
      expect(result.bookingId).toBe(mockReview.bookingId);
      expect(result.rating).toBe(mockReview.rating);
      expect(result.comment).toBe(mockReview.comment);
      expect(result.createdAt).toEqual(mockReview.createdAt);
    });

    it('should handle reviews with null comments', async () => {
      const reviewWithoutComment = { ...mockReview, comment: null };
      const flaggedReview = { ...reviewWithoutComment, flagged: true };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(reviewWithoutComment);
      (mockPrisma.review.update as jest.Mock).mockResolvedValue(flaggedReview);

      const result = await reviewService.flagReview('review-123', true);

      expect(result.comment).toBeNull();
      expect(result.flagged).toBe(true);
    });
  });

  describe('Flagged reviews in retrieval', () => {
    it('should exclude flagged reviews from tutor review list by default', async () => {
      const reviews = [
        {
          id: 'review-1',
          tutorId: 'tutor-123',
          studentId: 'student-1',
          bookingId: 'booking-1',
          rating: 5,
          comment: 'Great!',
          flagged: false,
          createdAt: new Date(),
        },
        {
          id: 'review-2',
          tutorId: 'tutor-123',
          studentId: 'student-2',
          bookingId: 'booking-2',
          rating: 1,
          comment: 'Inappropriate',
          flagged: true,
          createdAt: new Date(),
        },
      ];

      const nonFlaggedReviews = reviews.filter((r) => !r.flagged);

      (mockPrisma.review as any).findMany = jest.fn().mockResolvedValue(nonFlaggedReviews);
      (mockPrisma.review as any).count = jest.fn().mockResolvedValue(1);

      const result = await reviewService.getReviewsByTutorId('tutor-123');

      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].flagged).toBe(false);
    });

    it('should include flagged reviews when explicitly requested', async () => {
      const reviews = [
        {
          id: 'review-1',
          tutorId: 'tutor-123',
          studentId: 'student-1',
          bookingId: 'booking-1',
          rating: 5,
          comment: 'Great!',
          flagged: false,
          createdAt: new Date(),
        },
        {
          id: 'review-2',
          tutorId: 'tutor-123',
          studentId: 'student-2',
          bookingId: 'booking-2',
          rating: 1,
          comment: 'Inappropriate',
          flagged: true,
          createdAt: new Date(),
        },
      ];

      (mockPrisma.review as any).findMany = jest.fn().mockResolvedValue(reviews);
      (mockPrisma.review as any).count = jest.fn().mockResolvedValue(2);

      const result = await reviewService.getReviewsByTutorId('tutor-123', {
        includeFlagged: true,
      });

      expect(result.reviews).toHaveLength(2);
      expect(result.reviews.some((r) => r.flagged)).toBe(true);
    });
  });
});
