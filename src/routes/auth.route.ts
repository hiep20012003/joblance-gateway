import express, {Router} from 'express';
import {config} from '@gateway/config';
import {handleAsyncError} from '@hiep20012003/joblance-shared';

import {AuthController} from '../controllers/auth.controller';
import {AuthService} from '../services/api/auth.service';
import {authNotRefreshMiddleware} from '@gateway/middlewares/auth-not-refresh.middleware';

export class AuthRoute {
  private readonly authController: AuthController;
  public router: Router;

  constructor() {
    const authService = new AuthService(`${config.AUTH_BASE_URL}/api/v1`);
    this.authController = new AuthController(authService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'auth';
      next();
    });
    this.router.get('/users/:userId', handleAsyncError(this.authController.getUserById));
    this.router.post('/users', handleAsyncError(this.authController.signUp));
    this.router.post('/login', handleAsyncError(this.authController.signIn));
    this.router.post('/refresh', handleAsyncError(this.authController.refreshToken));
    this.router.post('/logout', authNotRefreshMiddleware, handleAsyncError(this.authController.logout));
    this.router.post('/users/password/change', authNotRefreshMiddleware, handleAsyncError(this.authController.changePassword));
    this.router.post('/tokens/password', handleAsyncError(this.authController.forgotPassword));
    this.router.post(
      '/tokens/password/validate',
      handleAsyncError(this.authController.validateResetPasswordToken)
    );
    this.router.post(
      '/users/password/reset',
      handleAsyncError(this.authController.resetPassword)
    );
    this.router.post(
      '/tokens/email/resend',
      handleAsyncError(this.authController.resendEmailVerification)
    );
    this.router.post(
      '/users/email/verify',
      handleAsyncError(this.authController.verifyEmail)
    );
    return this.router;
  };
}

export const authRoute: AuthRoute = new AuthRoute();
