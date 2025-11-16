import {Request, Response, NextFunction} from 'express';
import {GigsService} from '@gateway/services/api/gigs.service';
import {BaseController} from '@gateway/controllers/base.controller';

export class SearchController extends BaseController {
  constructor(private readonly gigService: GigsService) {
    super();
  }

  public searchGigById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('search', 'gig', 'by-id'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).searchGigById(req.params.gigId);
      }
    );
  };

  public searchGigAdvance = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('search', 'gig', 'advance'),
      async (forwardedHeader) => {
        return this.gigService.setHeader(forwardedHeader).search(req.body);
      }
    );
  };
}
