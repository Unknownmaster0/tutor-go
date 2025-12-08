import { ReviewService } from '../services/review.service';
import { RatingService } from '../services/rating.service';
import { RabbitMQService } from '../services/rabbitmq.service';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { TutorProfile } from '../../shared/database';

// Mock dependencies
jest.mock('../../shared/database', () => ({
  TutorProfile: {
    findOne: jest.fn(),
  },
}));

const mockPrisma = {
  review: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  booking: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

const mockRabbitMQService = {
  publishReviewSubmittedEvent: jest.fn(),
} as unknown as RabbitMQService;

describe('Review Service Integration', () => {
  let reviewService: ReviewService;
  let ratingService: RatingService;

  beforeEach(() => {
    ratingService = new RatingService(mockPrisma, mockRabbitMQService);
    reviewService = new ReviewService(mockPrisma, ratingService);
    jest.clearAllMocks();
  });

  describe('Complete review submission flow', () => {
    it('should create review, update rating, and publish event', async () => {
      const reviewData = {
        tutorId: 'tutor-123',
        studentId: 'student-456',
        bookingId: 'booking-789',
        rating: 5,
        comment: 'Excellent tutor!',
      };

      const completedBooking = {
        id: 'booking-789',
        tutorId: 'tutor-123',
        studentId: 'student-456',
        status: BookingStatus.completed,
        subject: 'Math',
        startTime: new Date(),
        endTime: new Date(),
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdReview = {
        id: 'review-123',
        ...reviewData,
        flagged: false,
        createdAt: new Date(),
      };

      const existingReviews = [
        {
          id: 'review-old-1',
          tutorId: 'tutor-123',
          studentId: 'student-1',
          bookingId: 'booking-1',
          rating: 4,
          comment: 'Good',
          flagged: false,
          createdAt: new Date(),
        },
        createdReview,
      ];

      const mockTutorProfile = {
        userId: 'tutor-123',
        rating: 0,
        totalReviews: 0,
        save: jest.fn(),
      };

      // Setup mocks
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(completedBooking);
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.review.create as jest.Mock).mockResolvedValue(createdReview);
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(existingReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      // Execute
      const result = await reviewService.createReview(reviewData);

      // Verify review creation
      expect(result).toEqual({
        id: 'review-123',
        tutorId: reviewData.tutorId,
        studentId: reviewData.studentId,
        bookingId: reviewData.bookingId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        flagged: false,
        createdAt: createdReview.createdAt,
      });

      // Verify rating calculation
      // Average: (4 + 5) / 2 = 4.5
      expect(mockTutorProfile.rating).toBe(4.5);
      expect(mockTutorProfile.totalReviews).toBe(2);
      expect(mockTutorProfile.save).toHaveBeenCalled();

      // Verify event publishing
      expect(mockRabbitMQService.publishReviewSubmittedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewId: 'review-123',
          tutorId: 'tutor-123',
          studentId: 'student-456',
          bookingId: 'booking-789',
          rating: 5,
          comment: 'Excellent tutor!',
        })
      );
    });

    it('should handle first review for a tutor', async () => {
      const reviewData = {
        tutorId: 'tutor-new',
        studentId: 'student-456',
        bookingId: 'booking-first',
        rating: 5,
        comment: 'First review!',
      };

      const completedBooking = {
        id: 'booking-first',
        tutorId: 'tutor-new',
        studentId: 'student-456',
        status: BookingStatus.completed,
        subject: 'Math',
        startTime: new Date(),
        endTime: new Date(),
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdReview = {
        id: 'review-first',
        ...reviewData,
        flagged: false,
        createdAt: new Date(),
      };

      const mockTutorProfile = {
        userId: 'tutor-new',
        rating: 0,
        totalReviews: 0,
        save: jest.fn(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(completedBooking);
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.review.create as jest.Mock).mockResolvedValue(createdReview);
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([createdReview]);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await reviewService.createReview(reviewData);

      // First review should set rating to 5.0
      expect(mockTutorProfile.rating).toBe(5.0);
      expect(mockTutorProfile.totalReviews).toBe(1);
    });

    it('should continue if RabbitMQ fails', async () => {
      const reviewData = {
        tutorId: 'tutor-123',
        studentId: 'student-456',
        bookingId: 'booking-789',
        rating: 5,
        comment: 'Test',
      };

      const completedBooking = {
        id: 'booking-789',
        tutorId: 'tutor-123',
        studentId: 'student-456',
        status: BookingStatus.completed,
        subject: 'Math',
        startTime: new Date(),
        endTime: new Date(),
        totalAmount: 50,
        paymentId: 'payment-123',
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdReview = {
        id: 'review-123',
        ...reviewData,
        flagged: false,
        createdAt: new Date(),
      };

      const mockTutorProfile = {
        userId: 'tutor-123',
        rating: 0,
        totalReviews: 0,
        save: jest.fn(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(completedBooking);
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.review.create as jest.Mock).mockResolvedValue(createdReview);
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([createdReview]);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);
      (mockRabbitMQService.publishReviewSubmittedEvent as jest.Mock).mockRejectedValue(
        new Error('RabbitMQ connection failed')
      );

      // Should not throw error
      const result = await reviewService.createReview(reviewData);

      // Review should still be created
      expect(result.id).toBe('review-123');
      // Rating should still be updated
      expect(mockTutorProfile.rating).toBe(5.0);
    });
  });

  describe('Review moderation impact on ratings', () => {
    it('should exclude flagged reviews from rating calculation', async () => {
      const tutorId = 'tutor-123';
      const reviewId = 'review-new';

      const reviews = [
        {
          id: 'review-1',
          tutorId,
          studentId: 'student-1',
          bookingId: 'booking-1',
          rating: 5,
          comment: 'Great',
          flagged: false,
          createdAt: new Date(),
        },
        {
          id: 'review-2',
          tutorId,
          studentId: 'student-2',
          bookingId: 'booking-2',
          rating: 1,
          comment: 'Bad (flagged)',
          flagged: true,
          createdAt: new Date(),
        },
        {
          id: reviewId,
          tutorId,
          studentId: 'student-3',
          bookingId: 'booking-3',
          rating: 4,
          comment: 'Good',
          flagged: false,
          createdAt: new Date(),
        },
      ];

      const nonFlaggedReviews = reviews.filter((r) => !r.flagged);

      const mockTutorProfile = {
        userId: tutorId,
        rating: 0,
        totalReviews: 0,
        save: jest.fn(),
      };

      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(nonFlaggedReviews);
      (TutorProfile.findOne as jest.Mock).mockResolvedValue(mockTutorProfile);

      await ratingService.updateTutorRating(tutorId, reviewId);

      // Average should be (5 + 4) / 2 = 4.5, not including the flagged review
      expect(mockTutorProfile.rating).toBe(4.5);
      expect(mockTutorProfile.totalReviews).toBe(2);
    });
  });
});
