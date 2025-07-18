import { HealthController } from '@gateway/controllers/health.controller';
import express, { Router } from 'express';

class HealthRoutes {
  private router: Router;
  private healController: HealthController;
  constructor() {
    this.router = express.Router();
    this.healController = new HealthController;
  }

  public routes(): Router {
    this.router.get('/gateway-health', this.healController.health);
    return this.router;
  }
}

export const healthRoutes: HealthRoutes = new HealthRoutes();
