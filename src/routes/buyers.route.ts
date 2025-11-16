import express, {Router} from 'express';
import {config} from '@gateway/config';
import {RENDERABLE_IMAGE_ALLOWED_MIMES, handleAsyncError, validateFile} from '@hiep20012003/joblance-shared';
import {BuyersService} from '@gateway/services/api/buyers.service';
import {BuyersController} from '@gateway/controllers/buyers.controller';
import multer from 'multer';
import {authNotRefreshMiddleware} from '@gateway/middlewares/auth-not-refresh.middleware';

export class BuyerRoutes {
  private readonly buyerController: BuyersController;
  public router: Router;

  constructor() {
    const buyerService = new BuyersService(`${config.USERS_BASE_URL}/api/v1`);
    this.buyerController = new BuyersController(buyerService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'users';
      next();
    });
    const upload = multer({storage: multer.memoryStorage()});

    // Buyer
    this.router.get('/buyers/:id', authNotRefreshMiddleware, handleAsyncError(this.buyerController.getBuyerById));
    this.router.get('/buyers/username/:username', handleAsyncError(this.buyerController.getBuyerByUsername));
    this.router.get('/buyers/email/:email', handleAsyncError(this.buyerController.getBuyerByEmail));
    this.router.get('/buyers', handleAsyncError(this.buyerController.getBuyers));
    this.router.patch('/buyers/:id', authNotRefreshMiddleware, upload.single('profilePictureFile'), validateFile(RENDERABLE_IMAGE_ALLOWED_MIMES), handleAsyncError(this.buyerController.updateBuyerById));

    return this.router;
  };
}

export const buyerRoutes: BuyerRoutes = new BuyerRoutes();
