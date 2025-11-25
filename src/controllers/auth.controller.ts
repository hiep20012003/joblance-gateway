import { NextFunction, Request, Response } from 'express';
import { BaseController } from '@gateway/controllers/base.controller';
import { AuthService } from '@gateway/services/api/auth.service';
import { cacheStore } from '@gateway/cache/redis.connection';
import {
  IAuth, IAuthDocument,
  JwtPayload,
  SuccessResponse
} from '@hiep20012003/joblance-shared';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { GatewayServer } from '@gateway/server';

export class AuthController extends BaseController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    super();
    this.authService = authService;
  }

  public async removeLoggedInUser(req: Request, res: Response): Promise<void> {
    const response = await cacheStore.removeLoggedInUserFromCache('loggedInUsers', req.params.username);
    GatewayServer.SocketsIOHandler.getSocketIO().emit('online', response);
    new SuccessResponse({
      message: 'User is offline', statusCode: StatusCodes.OK, reasonPhrase: ReasonPhrases.OK
    }).send(res);
  }

  public getUserById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'me'),
      async (forwardedHeader) => {
        return this.authService.setHeader(forwardedHeader).getUserById(req.params.userId);
      },
    );
  };

  public validateResetPasswordToken = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'validate-reset-token'),
      async (forwardedHeader) => {
        return this.authService.setHeader(forwardedHeader).validateResetPasswordToken(req.body.token as string);
      },
    );
  };

  public signUp = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'signup'),
      async (forwardedHeader) => {
        const payload = req.body as IAuth;
        return this.authService.setHeader(forwardedHeader).signUp(payload);
      },
    );
  };

  public signIn = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'signin'),
      async (forwardedHeader) => {
        const payload = req.body as IAuth;

        const [authResult] = await Promise.all([
          this.authService.setHeader(forwardedHeader).login(payload)
        ]);

        const { user, refreshToken, accessToken } = authResult.data as
          {
            user: IAuthDocument, refreshToken: { token: string; exp: number };
            accessToken: { token: string; exp: number };
          };

        req.session = { accessToken: accessToken.token, refreshToken: refreshToken.token };

        // if (user.id) {
        //   const loggedInUsers = await cacheStore.saveLoggedInUserToCache('loggedInUsers', user.id);
        //   GatewayServer.SocketsIOHandler.getSocketIO().emit('online', loggedInUsers);
        // }

        await cacheStore.setEx(
          `auth:refresh_token:user:${user.id}`,
          refreshToken.exp - Math.floor(Date.now() / 1000),
          refreshToken.token
        );

        return {
          status: authResult.status,
          data: {
            user,
            accessTokenExp: accessToken.exp,
            refreshTokenExp: refreshToken.exp,
          }
        };
      },
    );
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'refresh'),
      async (forwardedHeader) => {

        const { refreshToken } = req.session as {
          refreshToken: string
        };

        const result = await this.authService.setHeader(forwardedHeader).refreshToken(refreshToken);

        req.session = { accessToken: result.data.accessToken.token, refreshToken: result.data.refreshToken.token };

        // if (result?.data?.user?.id) {
        //   const loggedInUsers = await cacheStore.saveLoggedInUserToCache('loggedInUsers', result.data.user.id as string);
        //   GatewayServer.SocketsIOHandler.getSocketIO().emit('online', loggedInUsers);
        // }

        await cacheStore.setEx(
          `auth:refresh_token:user:${result.data.user.id}`,
          result.data.refreshToken.exp - Math.floor(Date.now() / 1000),
          result.data.refreshToken.token as string,
        );

        return {
          status: result.status,
          data: {
            user: result.data.user,
            accessTokenExp: result.data.accessToken.exp,
            refreshTokenExp: result.data.refreshToken.exp,
          }
        };
      },
    );
  };


  public logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'logout'),
      async (forwardedHeader) => {
        const { jti, exp } = req.currentUser as JwtPayload;

        const response = await this.authService.setHeader(forwardedHeader).logout();
        //
        // const loggedInUsers = await cacheStore.removeLoggedInUserFromCache('loggedInUsers', username!);
        // GatewayServer.SocketsIOHandler.getSocketIO().emit('online', loggedInUsers);

        const now = Math.floor(Date.now() / 1000);
        const remainingTTL = (exp ?? now) - now;
        await cacheStore.setEx(`blacklist:access:${jti}`, remainingTTL, '1');

        req.session = null;
        return response;
      },
    );
  };

  public forgotPassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'forgot-password'),
      async (forwardedHeader) => {
        const { email } = req.body as IAuth;

        return this.authService.setHeader(forwardedHeader).forgotPassword(email!);
      }
    );
  };

  public resetPassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'reset-password'),
      async (forwardedHeader) => {
        const payload = req.body as IAuth;

        return this.authService.setHeader(forwardedHeader).resetPassword(payload);
      }
    );
  };

  public resendEmailVerification = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'resend-email-verification'),
      async (forwardedHeader) => {
        const { email } = req.body as IAuth;
        return this.authService.setHeader(forwardedHeader).resendEmailVerification(email!);
      }
    );
  };

  public verifyEmail = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'verify-email'),
      async (forwardedHeader) => {
        res.cookie('verificationEmailSuccess', true, { httpOnly: false, secure: false, maxAge: 60 * 60 * 1000 });
        return this.authService.setHeader(forwardedHeader).verifyEmail(req.body);
      }
    );
  };

  public changePassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('auth', 'user', 'change-password'),
      async (forwardedHeader) => {
        return this.authService.setHeader(forwardedHeader).changePassword({ id: req?.currentUser?.sub, ...req.body });
      }
    );
  };
}
