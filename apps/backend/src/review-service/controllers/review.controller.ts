import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../../shared';

export class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService) {
    this.reviewService = reviewService;
  }

  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const review = await this.reviewService.createReview(req.body);
      ApiResponse.success(res, review, 'Review created successfully', 201);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('not found') ||
          error.message.includes('does not match')
        ) {
          ApiResponse.error(res, error.message, 404);
        } else if (
          error.message.includes('already exists') ||
          error.message.includes('Can only review')
        ) {
          ApiResponse.error(res, error.message, 400);
        } else {
          ApiResponse.error(res, 'Failed to create review', 500);
        }
      } else {
        ApiResponse.error(res, 'Failed to create review', 500);
      }
    }
  };

  getReviewsByTutorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { tutorId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

      const result = await this.reviewService.getReviewsByTutorId(tutorId, {
        limit,
        offset,
        includeFlagged: false,
      });

      ApiResponse.success(res, result, 'Reviews retrieved successfully');
    } catch (error) {
      ApiResponse.error(res, 'Failed to fetch reviews', 500);
    }
  };

  flagReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const { reviewId } = req.params;
      const { flagged } = req.body;

      const review = await this.reviewService.flagReview(reviewId, flagged);
      ApiResponse.success(res, review, 'Review flagged successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        ApiResponse.error(res, error.message, 404);
      } else {
        ApiResponse.error(res, 'Failed to flag review', 500);
      }
    }
  };
}
