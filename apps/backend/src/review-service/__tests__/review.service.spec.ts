import { ReviewService } from '../services/review.service';
import { PrismaClient, BookingStatus } from '@prisma/client';

// Mock PrismaClient
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

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const validReviewData = {
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

    it('should create a review successfully', async () => {
      const createdReview = {
        id: 'review-123',
        ...validReviewData,
        flagged: false,
        createdAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(completedBooking);
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.review.create as jest.Mock).mockResolvedValue(createdReview);

      const result = await reviewService.createReview(validReviewData);

      expect(result).toEqual({
        id: 'review-123',
        tutorId: validReviewData.tutorId,
        studentId: validReviewData.studentId,
        bookingId: validReviewData.bookingId,
        rating: validReviewData.rating,
        comment: validReviewData.comment,
        flagged: false,
        createdAt: createdReview.createdAt,
      });

      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: validReviewData.bookingId },
      });
      expect(mockPrisma.review.findUnique).toHaveBeenCalledWith({
        where: { bookingId: validReviewData.bookingId },
      });
      expect(mockPrisma.review.create).toHaveBeenCalledWith({
        data: {
          tutorId: validReviewData.tutorId,
          studentId: validReviewData.studentId,
          bookingId: validReviewData.bookingId,
          rating: validReviewData.rating,
          comment: validReviewData.comment,
          flagged: false,
        },
      });
    });

    it('should throw error if rating is out of range', async () => {
      const invalidData = { ...validReviewData, rating: 6 };

      await expect(reviewService.createReview(invalidData)).rejects.toThrow(
        'Rating must be between 1 and 5'
      );
    });

    it('should throw error if booking not found', async () => {
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.createReview(validReviewData)).rejects.toThrow(
        'Booking not found'
      );
    });

    it('should throw error if booking is not completed', async () => {
      const pendingBooking = { ...completedBooking, status: BookingStatus.pending };
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(pendingBooking);

      await expect(reviewService.createReview(validReviewData)).rejects.toThrow(
        'Can only review completed bookings'
      );
    });

    it('should throw error if student does not match booking', async () => {
      const wrongStudentBooking = { ...completedBooking, studentId: 'different-student' };
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(wrongStudentBooking);

      await expect(reviewService.createReview(validReviewData)).rejects.toThrow(
        'Only the student who made the booking can submit a review'
      );
    });

    it('should throw error if tutor does not match booking', async () => {
      const wrongTutorBooking = { ...completedBooking, tutorId: 'different-tutor' };
      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(wrongTutorBooking);

      await expect(reviewService.createReview(validReviewData)).rejects.toThrow(
        'Tutor ID does not match the booking'
      );
    });

    it('should throw error if review already exists for booking', async () => {
      const existingReview = {
        id: 'existing-review',
        ...validReviewData,
        flagged: false,
        createdAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(completedBooking);
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(existingReview);

      await expect(reviewService.createReview(validReviewData)).rejects.toThrow(
        'Review already exists for this booking'
      );
    });

    it('should create review without comment', async () => {
      const dataWithoutComment = { ...validReviewData };
      delete (dataWithoutComment as any).comment;

      const createdReview = {
        id: 'review-123',
        ...dataWithoutComment,
        comment: null,
        flagged: false,
        createdAt: new Date(),
      };

      (mockPrisma.booking.findUnique as jest.Mock).mockResolvedValue(completedBooking);
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.review.create as jest.Mock).mockResolvedValue(createdReview);

      const result = await reviewService.createReview(dataWithoutComment);

      expect(result.comment).toBeNull();
      expect(mockPrisma.review.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          comment: null,
        }),
      });
    });
  });

  describe('getReviewById', () => {
    it('should return review by id', async () => {
      const review = {
        id: 'review-123',
        tutorId: 'tutor-123',
        studentId: 'student-456',
        bookingId: 'booking-789',
        rating: 5,
        comment: 'Great!',
        flagged: false,
        createdAt: new Date(),
      };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(review);

      const result = await reviewService.getReviewById('review-123');

      expect(result).toEqual(review);
      expect(mockPrisma.review.findUnique).toHaveBeenCalledWith({
        where: { id: 'review-123' },
      });
    });

    it('should return null if review not found', async () => {
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await reviewService.getReviewById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getReviewsByTutorId', () => {
    const mockReviews = [
      {
        id: 'review-1',
        tutorId: 'tutor-123',
        studentId: 'student-1',
        bookingId: 'booking-1',
        rating: 5,
        comment: 'Excellent!',
        flagged: false,
        createdAt: new Date('2024-01-02'),
      },
      {
        id: 'review-2',
        tutorId: 'tutor-123',
        studentId: 'student-2',
        bookingId: 'booking-2',
        rating: 4,
        comment: 'Good',
        flagged: false,
        createdAt: new Date('2024-01-01'),
      },
    ];

    it('should return reviews for a tutor with pagination', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(2);

      const result = await reviewService.getReviewsByTutorId('tutor-123', {
        limit: 10,
        offset: 0,
      });

      expect(result.reviews).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
        where: { tutorId: 'tutor-123', flagged: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should exclude flagged reviews by default', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(2);

      await reviewService.getReviewsByTutorId('tutor-123');

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tutorId: 'tutor-123', flagged: false },
        })
      );
    });

    it('should include flagged reviews when specified', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(2);

      await reviewService.getReviewsByTutorId('tutor-123', { includeFlagged: true });

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tutorId: 'tutor-123' },
        })
      );
    });

    it('should use default pagination values', async () => {
      (mockPrisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.review.count as jest.Mock).mockResolvedValue(0);

      await reviewService.getReviewsByTutorId('tutor-123');

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        })
      );
    });
  });

  describe('flagReview', () => {
    const mockReview = {
      id: 'review-123',
      tutorId: 'tutor-123',
      studentId: 'student-456',
      bookingId: 'booking-789',
      rating: 5,
      comment: 'Great!',
      flagged: false,
      createdAt: new Date(),
    };

    it('should flag a review', async () => {
      const flaggedReview = { ...mockReview, flagged: true };

      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);
      (mockPrisma.review.update as jest.Mock).mockResolvedValue(flaggedReview);

      const result = await reviewService.flagReview('review-123', true);

      expect(result.flagged).toBe(true);
      expect(mockPrisma.review.update).toHaveBeenCalledWith({
        where: { id: 'review-123' },
        data: { flagged: true },
      });
    });

    it('should unflag a review', async () => {
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

    it('should throw error if review not found', async () => {
      (mockPrisma.review.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.flagReview('non-existent', true)).rejects.toThrow(
        'Review not found'
      );
    });
  });
});
