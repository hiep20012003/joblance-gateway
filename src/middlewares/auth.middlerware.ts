import { config } from '@gateway/config';
import { BadRequestError, NotAuthorizedError, IAuthPayload } from '@hiep20012003/joblance-shared';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

class AuthMiddlerware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError(
        'Token is not available. Please log in again.',
        'Error in GatewayService: verifyUser()'
      );
    }

    try {
      const payload: IAuthPayload = verify(req.session?.jwt, `${config.JWT_TOKEN}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError(
        'Token is not available. Please log in again.',
        'Error in GatewayService: verifyUser()'
      );
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new BadRequestError(
        'Authentication is required to access this route.',
        'Error in GatewayService: checkAuthentication()'
      );
    }
    next();
  }
}

export const authMiddlerware: AuthMiddlerware = new AuthMiddlerware();
