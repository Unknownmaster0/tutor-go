import { PrismaClient } from '@prisma/client';
import { TutorProfile } from '../../shared/database';
import { RabbitMQService } from './rabbitmq.service';

export class RatingService {
  private prisma: PrismaClient;
  private rabbitMQService?: RabbitMQService;

  constructor(prisma: PrismaClient, rabbitMQService?: RabbitMQService) {
    this.prisma = prisma;
    this.rabbitMQService = rabbitMQService;
  }

  async updateTutorRating(tutorId: string, reviewId: string): Promise<void> {
    // Get all non-flagged reviews for the tutor
    const reviews = await this.prisma.review.findMany({
      where: {
        tutorId,
        flagged: false,
      },
    });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Round to 1 decimal place
    const roundedRating = Math.round(averageRating * 10) / 10;

    // Update tutor profile in MongoDB
    const tutorProfile = await TutorProfile.findOne({ userId: tutorId });
    if (tutorProfile) {
      tutorProfile.rating = roundedRating;
      tutorProfile.totalReviews = totalReviews;
      await tutorProfile.save();
    }

    // Publish ReviewSubmittedEvent to RabbitMQ
    if (this.rabbitMQService) {
      const review = reviews.find((r) => r.id === reviewId);
      if (review) {
        try {
          await this.rabbitMQService.publishReviewSubmittedEvent({
            reviewId: review.id,
            tutorId: review.tutorId,
            studentId: review.studentId,
            bookingId: review.bookingId,
            rating: review.rating,
            comment: review.comment || undefined,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('Failed to publish review submitted event:', error);
          // Don't fail the rating update if event publishing fails
        }
      }
    }
  }
}
