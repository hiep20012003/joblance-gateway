import express, { Router } from 'express';
import { config } from '@gateway/config';
import { handleAsyncError } from '@hiep20012003/joblance-shared';

import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/api/auth.service';
import { AxiosService } from '../services/axios.service';

export class AuthRoute {
  private readonly authController: AuthController;
  public router: Router;

  constructor() {
    // Initialize AxiosService with config
    const axiosService = new AxiosService(`${config.AUTH_BASE_URL}/api/v1/auth`, 'auth');

    // Initialize AuthService with AxiosService
    const authService = new AuthService(axiosService);

    // Initialize AuthController with AuthService
    this.authController = new AuthController(authService);

    this.router = express.Router();
    this.routes();
  }

  routes(): Router {
    this.router.post('/signup', handleAsyncError(this.authController.signUp));
    // Add more auth-related routes here
    return this.router;
  }
}

export const authRoute: AuthRoute = new AuthRoute();
