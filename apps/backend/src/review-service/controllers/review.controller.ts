import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { validationResult } from 'express-validator';

export class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService) {
    this.reviewService = reviewService;
  }

  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const review = await this.reviewService.createReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('not found') ||
          error.message.includes('does not match')
        ) {
          res.status(404).json({ error: error.message });
        } else if (
          error.message.includes('already exists') ||
          error.message.includes('Can only review')
        ) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to create review' });
        }
      } else {
        res.status(500).json({ error: 'Failed to create review' });
      }
    }
  };

  getReviewsByTutorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
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

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  };

  flagReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { reviewId } = req.params;
      const { flagged } = req.body;

      const review = await this.reviewService.flagReview(reviewId, flagged);
      res.status(200).json(review);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to flag review' });
      }
    }
  };
}
