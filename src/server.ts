import http from 'http';

import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import cookieSession from 'cookie-session';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from '@gateway/config';
import { ApplicationError, DependencyError, NotFoundError, ServerError, ErrorResponse, ResponseOptions } from '@hiep20012003/joblance-shared';
import { appRoutes } from '@gateway/routes';
import { AppLogger } from '@gateway/utils/logger';

const SERVER_PORT = config.PORT || 4000;

export class GatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public async start(): Promise<void> {
    const operation = 'gateway-server-start';

    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.errorHandler(this.app);
    this.startServer(this.app, operation);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private errorHandler(app: Application): void {
    app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const operation = 'gateway-server-handle-error';

      AppLogger.error(
        `API ${req.originalUrl} unexpected error`,
        {
          req,
          operation,
          error: err instanceof ApplicationError ? err.serialize() : {
            name: (err as Error).name,
            message: (err as Error).message,
            stack: (err as Error).stack,
          }
        }
      );

      if (err instanceof ApplicationError) {
        new ErrorResponse({
          ...err.serializeForClient() as ResponseOptions
        }).send(res);
      } else {
        const serverError = new ServerError({
          clientMessage: 'Internal server error',
          cause: err,
          operation
        });
        new ErrorResponse({
          ...serverError.serializeForClient() as ResponseOptions
        }).send(res);
      }
    });

    app.use('/*splat', (req: Request, res: Response, _next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const operation = 'gateway-server-route-not-found';

      const err = new NotFoundError({
        clientMessage: `Endpoint not found: ${fullUrl}`,
        operation
      });

      AppLogger.error(
        `API ${req.originalUrl} route not found`,
        {
          req,
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
      }).send(res);
    });
  }


  private startServer(app: Application, operation: string): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer, operation);
    } catch (error) {
      throw new ServerError({
        clientMessage: 'Failed to start GatewayService server',
        cause: error,
        operation: 'gateway-server-error'
      });
    }
  }

  private startHttpServer(httpServer: http.Server, operation: string): void {
    try {
      AppLogger.info(`Gateway server started with process id ${process.pid}`, { operation });

      httpServer.listen(SERVER_PORT, () => {
        AppLogger.info(`Gateway server is running on port ${SERVER_PORT}`, { operation });
      });
    } catch (error) {
      throw new DependencyError({
        clientMessage: 'Failed to bind HTTP port',
        cause: error,
        operation: 'gateway-server-bind-error'
      });
    }
  }
}
