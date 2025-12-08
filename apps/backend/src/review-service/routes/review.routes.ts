import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticateToken } from '../../auth-service/middleware/auth.middleware';
import {
  createReviewValidator,
  getTutorReviewsValidator,
  flagReviewValidator,
} from '../validators/review.validator';

export function createReviewRoutes(reviewController: ReviewController): Router {
  const router = Router();

  // POST /reviews - Create a new review (authenticated)
  router.post('/', authenticateToken, createReviewValidator, reviewController.createReview);

  // GET /reviews/tutor/:tutorId - Get reviews for a tutor (public)
  router.get('/tutor/:tutorId', getTutorReviewsValidator, reviewController.getReviewsByTutorId);

  // PATCH /reviews/:reviewId/flag - Flag/unflag a review (authenticated)
  router.patch(
    '/:reviewId/flag',
    authenticateToken,
    flagReviewValidator,
    reviewController.flagReview,
  );

  return router;
}
