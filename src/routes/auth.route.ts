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

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.service = 'auth-service';
      next();
    });
    this.router.post('/auth/signup', handleAsyncError(this.authController.signUp));
    this.router.post('/auth/signin', handleAsyncError(this.authController.signIn));
    this.router.post('/auth/refresh-token', handleAsyncError(this.authController.refreshToken));
    this.router.post('/auth/logout', handleAsyncError(this.authController.logout)); // Added logout route
    this.router.post('/auth/resend-verification', handleAsyncError(this.authController.resendEmailVerification));
    this.router.post('/auth/verify-email', handleAsyncError(this.authController.verifyEmail));
    // Add more auth-related routes here
    return this.router;
  };
}

export const authRoute: AuthRoute = new AuthRoute();
