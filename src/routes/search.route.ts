import express, { Router } from 'express';
import { config } from '@gateway/config';
import { handleAsyncError } from '@hiep20012003/joblance-shared';
import { SearchController } from '@gateway/controllers/search.controller';
import { GigsService } from '@gateway/services/api/gigs.service';

export class SearchRoutes {
  private readonly searchController: SearchController;
  public router: Router;

  constructor() {
    const gigService = new GigsService(`${config.GIGS_BASE_URL}/api/v1`);
    this.searchController = new SearchController(gigService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'gigs';
      next();
    });
    // Search
    this.router.get('/gigs/search/:gigId', handleAsyncError(this.searchController.searchGigById));
    this.router.post('/gigs/search', handleAsyncError(this.searchController.searchGigAdvance));
    return this.router;
  };
}

export const searchRoutes: SearchRoutes = new SearchRoutes();
