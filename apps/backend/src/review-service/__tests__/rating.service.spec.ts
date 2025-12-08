import { RatingService } from '../services/rating.service';
import { RabbitMQService } from '../services/rabbitmq.service';
import { PrismaClient } from '@prisma/client';
import { TutorProfile } from '../../shared/database';

// Mock dependencies
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    findOne: jest.fn(),
  },
}));

const mockPrisma = {
  review: {
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

const mockRabbitMQService = {
  publishReviewSubmittedEvent: jest.fn(),
} as unknown as RabbitMQService;

describe('RatingService', () => {
  let ratingService: RatingService;

  beforeEach(() => {
    ratingService = new RatingService(mockPrisma, mockRabbitMQService);
    jest.clearAllMocks();
  });

  describe('updateTutorRating', () => {
    const tutorId = 'tutor-123';
    const reviewId = 'review-123';

    const mockReviews = [
      {
        id: 'review-1',
        tutorId,
        studentId: 'student-1',
        bookingId: 'booking-1',
        rating: 5,
        comment: 'Excellent!',
        flagged: false,
        createdAt: new Date(),
      },
      {
        id: 'review-2',
        tutorId,
        studentId: 'student-2',
        bookingId: 'booking-2',
        rating: 4,
        comment: 'Good',
        flagged: false,
        createdAt: new Date(),
      },
      {
        id: reviewId,
        tutorId,
        studentId: 'student-3',
        bookingId: 'booking-3',
        rating: 5,
        comment: 'Great!',
        flagged: false,
        createdAt: new Date(),
      },
    ];

    const mockTutorProfile = {
      userId: tutorId,
      rating: 0,
      totalReviews: 0,
      save: jest.fn(),
    };

    it('should calculate and update average rating', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await ratingService.updateTutorRating(tutorId, reviewId);

      // Average: (5 + 4 + 5) / 3 = 4.666... rounded to 4.7
      expect(mockTutorProfile.rating).toBe(4.7);
      expect(mockTutorProfile.totalReviews).toBe(3);
      expect(mockTutorProfile.save).toHaveBeenCalled();
    });

    it('should exclude flagged reviews from calculation', async () => {
      const reviewsWithFlagged = [
        ...mockReviews,
        {
          id: 'review-flagged',
          tutorId,
          studentId: 'student-4',
          bookingId: 'booking-4',
          rating: 1,
          comment: 'Bad',
          flagged: true,
          createdAt: new Date(),
        },
      ];

      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await ratingService.updateTutorRating(tutorId, reviewId);

      // Should still be 4.7, not affected by flagged review
      expect(mockTutorProfile.rating).toBe(4.7);
      expect(mockTutorProfile.totalReviews).toBe(3);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
        where: {
          tutorId,
          flagged: false,
        },
      });
    });

    it('should set rating to 0 if no reviews', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await ratingService.updateTutorRating(tutorId, reviewId);

      expect(mockTutorProfile.rating).toBe(0);
      expect(mockTutorProfile.totalReviews).toBe(0);
      expect(mockTutorProfile.save).toHaveBeenCalled();
    });

    it('should handle tutor profile not found', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(null);

      // Should not throw error
      await expect(ratingService.updateTutorRating(tutorId, reviewId)).resolves.not.toThrow();
    });

    it('should publish ReviewSubmittedEvent to RabbitMQ', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await ratingService.updateTutorRating(tutorId, reviewId);

      expect(mockRabbitMQService.publishReviewSubmittedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewId,
          tutorId,
          studentId: 'student-3',
          bookingId: 'booking-3',
          rating: 5,
          comment: 'Great!',
          timestamp: expect.any(Date),
        })
      );
    });

    it('should handle RabbitMQ publish failure gracefully', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);
      (mockRabbitMQService.publishReviewSubmittedEvent as jest.Mock).mockRejectedValue(
        new Error('RabbitMQ error')
      );

      // Should not throw error
      await expect(ratingService.updateTutorRating(tutorId, reviewId)).resolves.not.toThrow();

      // Rating should still be updated
      expect(mockTutorProfile.rating).toBe(4.7);
      expect(mockTutorProfile.save).toHaveBeenCalled();
    });

    it('should round rating to 1 decimal place', async () => {
      const reviewsForRounding = [
        { ...mockReviews[0], rating: 5 },
        { ...mockReviews[1], rating: 4 },
        { ...mockReviews[2], rating: 3 },
      ];

      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(reviewsForRounding);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await ratingService.updateTutorRating(tutorId, reviewId);

      // Average: (5 + 4 + 3) / 3 = 4.0
      expect(mockTutorProfile.rating).toBe(4.0);
    });

    it('should work without RabbitMQ service', async () => {
      const serviceWithoutRabbitMQ = new RatingService(mockPrisma);
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await expect(
        serviceWithoutRabbitMQ.updateTutorRating(tutorId, reviewId)
      ).resolves.not.toThrow();

      expect(mockTutorProfile.rating).toBe(4.7);
      expect(mockTutorProfile.save).toHaveBeenCalled();
    });
  });
});
