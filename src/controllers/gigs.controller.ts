import {Request, Response, NextFunction} from 'express';
import {BaseController} from '@gateway/controllers/base.controller';
import {GigsService} from '@gateway/services/api/gigs.service';
import {createFormData} from '@gateway/utils/helper';

export class GigsController extends BaseController {
  constructor(private readonly gigService: GigsService) {
    super();
  }

  public createGig = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'create'),
      async (forwardedHeader) => {
        const formData = createFormData(req);

        return this.gigService.setHeader(forwardedHeader).createGig(formData);
      }
    );
  };

  public updateGig = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'update'),
      async (forwardedHeader) => {
        const formData = createFormData(req, {
          sellerId: req.currentUser?.sub,
          username: req.currentUser?.username,
          email: req.currentUser?.email
        });

        return this.gigService.setHeader(forwardedHeader).updateGig(req.params.gigId, formData);
      }
    );
  };

  public activeGig = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'update'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).activeGig(req.params.gigId);
      }
    );
  };

  public inactiveGig = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'update'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).inactiveGig(req.params.gigId);
      }
    );
  };

  public deleteGig = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'delete'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).deleteGig(req.params.gigId);
      }
    );
  };

  public getGigById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'get-by-id'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).getGigById(req.params.gigId);
      }
    );
  };

  public getTopGigs = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'get-all'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).getTopGigs(req.query);
      }
    );
  };

  public getGigsBySeller = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'get-by-seller'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).getGigsBySeller(req.params.username, req.query);
      }
    );
  };

  public getActiveGigsBySeller = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'get-by-seller'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).getActiveGigsBySeller(req.params.username, req.query);
      }
    );
  };


  public getInactiveGigsBySeller = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'get-inactive-by-seller'),
      async (forwardedHeader) => {

        const query = {...req.query, status: false};
        return this.gigService.setHeader(forwardedHeader).getInactiveGigsBySeller(req.params.username, query);
      }
    );
  };

  public getGigsSimilar = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'get-similar'),
      async (forwardedHeader) => {

        return this.gigService.setHeader(forwardedHeader).getGigsSimilar(req.params.gigId);
      }
    );
  };
}
