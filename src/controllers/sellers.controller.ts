import {Request, Response, NextFunction} from 'express';
import {SellersService} from '@gateway/services/api/sellers.service';
import {BaseController} from '@gateway/controllers/base.controller';

export class SellersController extends BaseController {
  constructor(private readonly sellerService: SellersService) {
    super();
  }

  public createSeller = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('sellers', 'seller', 'create'),
      async (forwardedHeader) => {

        return this.sellerService.setHeader(forwardedHeader).createSeller(req.currentUser?.sub as string, req.body);
      }
    );
  };

  public updateSeller = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('sellers', 'seller', 'update'),
      async (forwardedHeader) => {
        console.log(req.params.sellerId, req.body);
        return this.sellerService.setHeader(forwardedHeader).updateSeller(req.params.sellerId, req.body);
      }
    );
  };

  public getSellerByUsername = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('sellers', 'seller', 'get-by-username'),
      async (forwardedHeader) => {

        return this.sellerService.setHeader(forwardedHeader).getSellerByUsername(req.params.username);
      }
    );
  };

  public getCurrentSeller = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('sellers', 'seller', 'get-current'),
      async (forwardedHeader) => {

        return this.sellerService.setHeader(forwardedHeader).getSellerById(req.currentUser?.sub as string);
      }
    );
  };

  public getSellerById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('sellers', 'seller', 'get-by-id'),
      async (forwardedHeader) => {

        return this.sellerService.setHeader(forwardedHeader).getSellerById(req.params.sellerId);
      }
    );
  };

  public getSellers = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('sellers', 'seller', 'get-all'),
      async (forwardedHeader) => {
        return this.sellerService.setHeader(forwardedHeader).getSellers(req.query);
      }
    );
  };

  public getTopSellers = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('gigs', 'gig', 'get-all'),
      async (forwardedHeader) => {

        return this.sellerService.setHeader(forwardedHeader).getTopSellers(req.query);
      }
    );
  };
}
