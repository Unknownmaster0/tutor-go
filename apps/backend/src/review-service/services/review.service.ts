import { PrismaClient, Review, BookingStatus } from '@prisma/client';
import { CreateReviewDto, ReviewResponseDto } from '../dto';
import { RatingService } from './rating.service';

export class ReviewService {
  private prisma: PrismaClient;
  private ratingService?: RatingService;

  constructor(prisma: PrismaClient, ratingService?: RatingService) {
    this.prisma = prisma;
    this.ratingService = ratingService;
  }

  async createReview(data: CreateReviewDto): Promise<ReviewResponseDto> {
    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if booking exists and is completed
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== BookingStatus.completed) {
      throw new Error('Can only review completed bookings');
    }

    // Verify that the student is the one who made the booking
    if (booking.studentId !== data.studentId) {
      throw new Error('Only the student who made the booking can submit a review');
    }

    // Verify that the tutor matches
    if (booking.tutorId !== data.tutorId) {
      throw new Error('Tutor ID does not match the booking');
    }

    // Check if review already exists for this booking
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingReview) {
      throw new Error('Review already exists for this booking');
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        tutorId: data.tutorId,
        studentId: data.studentId,
        bookingId: data.bookingId,
        rating: data.rating,
        comment: data.comment || null,
        flagged: false,
      },
    });

    // Update tutor rating and publish event
    if (this.ratingService) {
      try {
        await this.ratingService.updateTutorRating(data.tutorId, review.id);
      } catch (error) {
        console.error('Failed to update tutor rating:', error);
        // Don't fail the review creation if rating update fails
      }
    }

    return this.mapToResponseDto(review);
  }

  async getReviewById(id: string): Promise<ReviewResponseDto | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return null;
    }

    return this.mapToResponseDto(review);
  }

  async getReviewsByTutorId(
    tutorId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeFlagged?: boolean;
    }
  ): Promise<{ reviews: ReviewResponseDto[]; total: number }> {
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;
    const includeFlagged = options?.includeFlagged || false;

    const where: any = { tutorId };
    if (!includeFlagged) {
      where.flagged = false;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map((review) => this.mapToResponseDto(review)),
      total,
    };
  }

  async flagReview(reviewId: string, flagged: boolean): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: { flagged },
    });

    return this.mapToResponseDto(updatedReview);
  }

  private mapToResponseDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      tutorId: review.tutorId,
      studentId: review.studentId,
      bookingId: review.bookingId,
      rating: review.rating,
      comment: review.comment,
      flagged: review.flagged,
      createdAt: review.createdAt,
    };
  }
}
