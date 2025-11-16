import {Request, Response, NextFunction} from 'express';
import {BaseController} from '@gateway/controllers/base.controller';
import {BuyersService} from '@gateway/services/api/buyers.service';
import {createFormData} from '@gateway/utils/helper';

export class BuyersController extends BaseController {
  constructor(private readonly buyerService: BuyersService) {
    super();
  }

  public getBuyerById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('buyers', 'user', 'get-by-id'),
      async (forwardedHeader) => {

        return this.buyerService.setHeader(forwardedHeader).getBuyerById(req.params.id);
      }
    );
  };

  public getBuyerByUsername = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('buyers', 'user', 'get-by-username'),
      async (forwardedHeader) => {
        return this.buyerService.setHeader(forwardedHeader).getBuyerByUsername(req.params.username);
      }
    );
  };

  public getBuyerByEmail = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('buyers', 'user', 'get-by-username'),
      async (forwardedHeader) => {

        return this.buyerService.setHeader(forwardedHeader).getBuyerByEmail(req.params.email);
      }
    );
  };

  public getBuyers = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('buyers', 'user', 'get-all'),
      async (forwardedHeader) => {

        return this.buyerService.setHeader(forwardedHeader).getBuyers(req.query);
      }
    );
  };

  public updateBuyerById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('buyers', 'user', 'update-current'),
      async (forwardedHeader) => {
        const formData = createFormData(req);

        return this.buyerService.setHeader(forwardedHeader).updateBuyerById(req.params.id, formData);
      }
    );
  };
}
