import { Request, Response, NextFunction } from 'express';
import { toKebabCase } from '@hiep20012003/joblance-shared';
import { AppLogger } from '@gateway/utils/logger';
import { AuthService } from '@gateway/services/api/auth.service';

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public signUp = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {

    const response = await this.authService.signUp(req.body);

    AppLogger.info(
      `${req.method.toUpperCase()} ${req.originalUrl} request to [${toKebabCase(this.authService.constructor.name)}] completed`,
      {
        operation: 'auth-signup-request',
        metadata: response.data as Record<string, unknown>
      }
    );

    res.status(response.status).json(response.data);
  };

  public logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { refreshToken } = req.cookies;
    const response = await this.authService.logout({ refreshToken: refreshToken as string });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh-token'
    });

    AppLogger.info(
      `${req.method.toUpperCase()} ${req.originalUrl} request to [${toKebabCase(this.authService.constructor.name)}] completed`,
      {
        operation: 'auth-logout-request',
        metadata: { userId: 'unknown' } // User ID might not be available directly from cookie
      }
    );

    res.status(response.status).json({ message: 'Logged out successfully' });
  };

  public signIn = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const response = await this.authService.signIn(req.body);
    const data = response.data as { refreshToken: string; [key: string]: unknown };
    const { refreshToken, ...rest } = data;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh-token', // Or a more generic path if needed
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    AppLogger.info(
      `${req.method.toUpperCase()} ${req.originalUrl} request to [${toKebabCase(this.authService.constructor.name)}] completed`,
      {
        operation: 'auth-signin-request',
        metadata: rest as Record<string, unknown>
      }
    );

    res.status(response.status).json(rest);
  };

  public refreshToken = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { refreshToken: oldRefreshToken } = req.cookies;
    const response = await this.authService.refreshToken({ refreshToken: oldRefreshToken as string });

    const { accessToken, refreshToken: newRefreshToken } = response.data as {
      accessToken: string,
      refreshToken: string
    };

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    AppLogger.info(
      `${req.method.toUpperCase()} ${req.originalUrl} request to [${toKebabCase(this.authService.constructor.name)}] completed`,
      {
        operation: 'auth-refresh-token-request',
        metadata: { accessToken }
      }
    );

    res.status(response.status).json({ accessToken });
  };

  public resendEmailVerification = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {

    const response = await this.authService.resendEmailVerification(req.body);

    AppLogger.info(
      `${req.method.toUpperCase()} ${req.originalUrl} request to [${toKebabCase(this.authService.constructor.name)}] completed`,
      {
        operation: 'auth-resend-email-verification-request',
        metadata: response.data as Record<string, unknown>
      }
    );

    res.status(response.status).json(response.data);
  };

  public verifyEmail = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {

    const response = await this.authService.verifyEmail(req.body);

    AppLogger.info(
      `${req.method.toUpperCase()} ${req.originalUrl} request to [${toKebabCase(this.authService.constructor.name)}] completed`,
      {
        operation: 'auth-verify-email-request',
        metadata: response.data as Record<string, unknown>
      }
    );

    res.status(response.status).json(response.data);
  };
}
