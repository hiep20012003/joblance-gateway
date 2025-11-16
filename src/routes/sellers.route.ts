import express, {Router} from 'express';
import {config} from '@gateway/config';
import {handleAsyncError} from '@hiep20012003/joblance-shared';
import {SellersService} from '@gateway/services/api/sellers.service';
import {SellersController} from '@gateway/controllers/sellers.controller';
import {authNotRefreshMiddleware} from '@gateway/middlewares/auth-not-refresh.middleware';


export class SellerRoutes {
  private readonly sellerController: SellersController;
  public router: Router;

  constructor() {
    const sellerService = new SellersService(`${config.USERS_BASE_URL}/api/v1`);
    this.sellerController = new SellersController(sellerService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'users';
      next();
    });
    // Seller
    this.router.get('/sellers/top', handleAsyncError(this.sellerController.getTopSellers));
    this.router.post('/sellers', authNotRefreshMiddleware, handleAsyncError(this.sellerController.createSeller));
    this.router.get('/sellers/:sellerId', handleAsyncError(this.sellerController.getSellerById));
    this.router.get('/sellers/username/:username', handleAsyncError(this.sellerController.getSellerByUsername));
    this.router.get('/sellers', handleAsyncError(this.sellerController.getSellers));

    this.router.patch('/sellers/:sellerId', authNotRefreshMiddleware, handleAsyncError(this.sellerController.updateSeller));

    return this.router;
  };
}

export const sellerRoutes: SellerRoutes = new SellerRoutes();
