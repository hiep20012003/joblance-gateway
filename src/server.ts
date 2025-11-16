import http from 'http';

import {Application, json, urlencoded, Request, Response, NextFunction} from 'express';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import {config} from '@gateway/config';
import {
  ApplicationError,
  DependencyError,
  NotFoundError,
  ServerError,
  ErrorResponse,
  ResponseOptions
} from '@hiep20012003/joblance-shared';
import {appRoutes} from '@gateway/routes';
import {AppLogger} from '@gateway/utils/logger';
import cookieSession from 'cookie-session';
import {cacheStore} from '@gateway/cache/redis.connection';
import {SocketsIOHandler} from '@gateway/sockets/sockets';
import {isAxiosError} from 'axios';

const SERVER_PORT = config.PORT || 4000;

export class GatewayServer {
  public static SocketsIOHandler: SocketsIOHandler;
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public async start(): Promise<void> {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.errorHandler(this.app);
    this.startRedis();
    this.startServer(this.app);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        sameSite: 'lax',
        secure: config.NODE_ENV !== 'dev',
        ...(config.NODE_ENV !== 'dev' && {
          sameSite: 'none'
        })
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(cookieParser());
    app.use(compression());
    app.use(
      json({
        limit: '200mb',
        verify(req: Request, _res, buf) {
          if (req.originalUrl.startsWith('/api/v1/webhooks/stripe')) {
            req.rawBody = buf;
          }
        }
      })
    );
    app.use(urlencoded({extended: true, limit: '200mb'}));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private startRedis(): void {
    cacheStore.connect();
  }

  private errorHandler(app: Application): void {
    app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const operation = req.operation ?? 'unknown_operation';
      const durationMs = req.durationMs ?? 0;

      if (isAxiosError(err) && err.response?.data) {
        const errorResponse = err.response.data as ResponseOptions;

        AppLogger.error(errorResponse.message ?? 'internal server error', {
          req,
          res,
          operation: 'server:external-service-error',
          context: {
            url: req.originalUrl,
            method: req.method,
            clientIp: req.ip,
            audience: req.audience,
            durationMs
          },
          metadata: {
            audience: req.audience,
            ...errorResponse
          }
        });

        new ErrorResponse({...errorResponse}).send(res, true);
        return;
      }

      // ApplicationError / custom errors
      if (err instanceof ApplicationError) {
        AppLogger.error(err.message, {
          req, res,
          operation,
          context: {
            url: req.originalUrl,
            method: req.method,
            clientIp: req.ip,
            audience: req.audience,
            durationMs
          },
          error: err.serialize()
        });

        new ErrorResponse({...(err.serializeForClient() as ResponseOptions)}).send(res, true);
        return;
      }


      AppLogger.error(`API ${req.originalUrl} unexpected error`, {
        operation, req, res,
        context: {
          url: req.originalUrl,
          method: req.method,
          clientIp: req.ip,
          audience: req.audience,
          durationMs
        },
        error: {
          name: (err as Error)?.name,
          message: (err as Error)?.message,
          stack: (err as Error)?.stack
        }
      });

      const serverError = new ServerError({
        clientMessage: 'Internal server error',
        cause: err,
        operation
      });

      new ErrorResponse({...(serverError.serializeForClient() as ResponseOptions)}).send(res, true);
    });

    app.use('/*splat', (req: Request, res: Response, _next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const operation = 'server:route-not-found';

      const err = new NotFoundError({
        clientMessage: 'Internal server error',
        logMessage: `Endpoint not found: ${fullUrl}`,
        operation
      });

      AppLogger.error(
        `API ${req.originalUrl} route not found`,
        {
          req, res,
          operation,
          error: err instanceof ApplicationError ? err.serialize() : {
            name: (err as Error).name,
            message: (err as Error).message,
            stack: (err as Error).stack,
          }
        }
      );
      new ErrorResponse({
        ...err.serializeForClient() as ResponseOptions
      }).send(res, true);
    });

  }


  private startServer(app: Application): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      GatewayServer.SocketsIOHandler = new SocketsIOHandler(httpServer);
      this.startHttpServer(httpServer);
      GatewayServer.SocketsIOHandler.listen();
    } catch (error) {
      throw new ServerError({
        clientMessage: 'Failed to start GatewayService server',
        cause: error,
        operation: 'server:error'
      });
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    try {
      AppLogger.info(`Gateway server started with process id ${process.pid}`, {operation: 'server:http-start'});

      httpServer.listen(SERVER_PORT, () => {
        AppLogger.info(`Gateway server is running on port ${SERVER_PORT}`, {operation: 'server:http-listening'});
      });

    } catch (error) {
      throw new DependencyError({
        clientMessage: 'Failed to bind HTTP port',
        cause: error,
        operation: 'server:bind-error'
      });
    }
  }
}
