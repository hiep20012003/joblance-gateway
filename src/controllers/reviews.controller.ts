import {Request, Response, NextFunction} from 'express';
import {BaseController} from '@gateway/controllers/base.controller';
import {ReviewsService} from '@gateway/services/api/reviews.service';

export class ReviewsController extends BaseController {
  constructor(private readonly reviewsService: ReviewsService) {
    super();
  }

  public queryReviews = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('reviews', 'review', 'get-by-gig-id'),
      async (forwardedHeader) => {
        return this.reviewsService.setHeader(forwardedHeader).queryReviews(req.query);
      }
    );
  };

  public replyReview = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('reviews', 'review', 'get-by-seller-id'),
      async (forwardedHeader) => {

        return this.reviewsService.setHeader(forwardedHeader).replyReview(req.body);
      }
    );
  };

  public addReview = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('reviews', 'review', 'create'),
      async (forwardedHeader) => {

        return this.reviewsService.setHeader(forwardedHeader).addReview(req.body);
      }
    );
  };
}
