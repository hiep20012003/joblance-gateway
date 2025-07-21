import { Request, Response, NextFunction } from 'express';
import { SignUpRequest, toKebabCase } from '@hiep20012003/joblance-shared';
import { AppLogger } from '@gateway/utils/logger';
import { AuthService } from '@gateway/services/api/auth.service';

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public signUp = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const requestData: SignUpRequest = req.body as SignUpRequest;

    const response = await this.authService.signUp(requestData);

    AppLogger.info(
      `${req.method.toUpperCase()} ${req.originalUrl} request to [${toKebabCase(this.authService.constructor.name)}] completed`,
      {
        operation: 'auth-signup-request',
        metadata: { ...response.data }
      }
    );

    res.status(response.status).json(response.data);
  };
}
