import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import {
  createReviewValidator,
  getTutorReviewsValidator,
  flagReviewValidator,
} from '../validators/review.validator';

export function createReviewRoutes(reviewController: ReviewController): Router {
  const router = Router();

  // POST /reviews - Create a new review
  router.post('/', createReviewValidator, reviewController.createReview);

  // GET /reviews/tutor/:tutorId - Get reviews for a tutor
  router.get('/tutor/:tutorId', getTutorReviewsValidator, reviewController.getReviewsByTutorId);

  // PATCH /reviews/:reviewId/flag - Flag/unflag a review
  router.patch('/:reviewId/flag', flagReviewValidator, reviewController.flagReview);

  return router;
}
