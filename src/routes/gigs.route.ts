import express, {Router} from 'express';
import {GigsController} from '@gateway/controllers/gigs.controller';
import {GigsService} from '@gateway/services/api/gigs.service';
import multer from 'multer';
import {config} from '@gateway/config';
import {RENDERABLE_IMAGE_ALLOWED_MIMES, handleAsyncError, validateFile} from '@hiep20012003/joblance-shared';
import {authNotRefreshMiddleware} from '@gateway/middlewares/auth-not-refresh.middleware';

class GigsRoutes {
  private readonly router: Router;
  private readonly gigsController: GigsController;

  constructor() {
    this.router = express.Router();
    const gigService = new GigsService(`${config.GIGS_BASE_URL}/api/v1`);
    this.gigsController = new GigsController(gigService);
  }

  public routes(): Router {
    this.router.use((req, _res, next) => {
      req.audience = 'gigs';
      next();
    });

    const upload = multer({storage: multer.memoryStorage()});

    // ----------------------------
    // GET
    // ----------------------------
    this.router.get('/gigs/top', handleAsyncError(this.gigsController.getTopGigs));
    this.router.get('/gigs/:gigId', handleAsyncError(this.gigsController.getGigById)); // Detail
    this.router.get('/gigs/:gigId/similar', handleAsyncError(this.gigsController.getGigsSimilar)); // Similar gigs

    // Seller nested routes
    this.router.get('/sellers/:username/gigs', authNotRefreshMiddleware, handleAsyncError(this.gigsController.getGigsBySeller)); // Seller's gigs
    this.router.get(
      '/sellers/:username/gigs/inactive',
      authNotRefreshMiddleware,
      handleAsyncError(this.gigsController.getInactiveGigsBySeller)
    ); // Inactive gigs

    this.router.get(
      '/sellers/:username/gigs/active',
      handleAsyncError(this.gigsController.getActiveGigsBySeller)
    ); // Active gigs

    // ----------------------------
    // POST
    // ----------------------------
    this.router.post(
      '/gigs',
      upload.single('coverImageFile'),
      validateFile(RENDERABLE_IMAGE_ALLOWED_MIMES),
      authNotRefreshMiddleware,
      handleAsyncError(this.gigsController.createGig)
    );

    // ----------------------------
    // PATCH
    // ----------------------------
    this.router.patch(
      '/gigs/:gigId',
      upload.single('coverImageFile'),
      authNotRefreshMiddleware,
      handleAsyncError(this.gigsController.updateGig)
    );

    this.router.patch(
      '/gigs/:gigId/active',
      authNotRefreshMiddleware,
      handleAsyncError(this.gigsController.activeGig)
    );

    this.router.patch(
      '/gigs/:gigId/inactive',
      authNotRefreshMiddleware,
      handleAsyncError(this.gigsController.inactiveGig)
    );

    // ----------------------------
    // DELETE
    // ----------------------------
    this.router.delete('/gigs/:gigId', authNotRefreshMiddleware, handleAsyncError(this.gigsController.deleteGig)); // Delete gig under seller

    return this.router;
  }
}

export const gigRoutes: GigsRoutes = new GigsRoutes();
