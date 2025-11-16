import express, { Router } from 'express';
import { config } from '@gateway/config';
import { handleAsyncError } from '@hiep20012003/joblance-shared';
import { ReviewsService } from '@gateway/services/api/reviews.service';
import { ReviewsController } from '@gateway/controllers/reviews.controller';

export class ReviewRoutes {
  private readonly reviewController: ReviewsController;
  public router: Router;

  constructor() {
    const reviewsService = new ReviewsService(`${config.REVIEWS_BASE_URL}/api/v1`);
    this.reviewController = new ReviewsController(reviewsService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'reviews';
      next();
    });

    this.router.get('/reviews', handleAsyncError(this.reviewController.queryReviews));
    this.router.post('/reviews', handleAsyncError(this.reviewController.addReview));
    this.router.patch('/reviews/reply', handleAsyncError(this.reviewController.replyReview));

    return this.router;
  };
}

export const reviewRoutes: ReviewRoutes = new ReviewRoutes();
