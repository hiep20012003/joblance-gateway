import http from 'http';

import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import cookieSession from 'cookie-session';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import { config } from '@gateway/config';
// import { elasticsearch } from './elasticsearch';
import { DependencyError, errorHandler, NotFoundError, ServerError } from '@hiep20012003/joblance-shared';
import { appRoutes } from '@gateway/routes';
import { logger } from '@gateway/app';

const SERVER_PORT = config.PORT || 4000;

export class GatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standarMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.errorHandlerMiddleware(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
        // sameSite: none
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

  private standarMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  // private startElasticSearch(): void {
  //   elasticsearch.checkConnection();
  // }

  private errorHandlerMiddleware(app: Application): void {
    app.use('*', (req: Request, res: Response, _next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      const notFoundError = new NotFoundError(
        `Endpoint not found: ${fullUrl}`,
        'GatewayService.errorHandler',
        'ENDPOINT_NOT_FOUND'
      );

      logger.error(notFoundError);

      res.status(StatusCodes.NOT_FOUND).json(notFoundError.serialize());
    });

    app.use(errorHandler(logger));
  }


  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      await this.startHttpServer(httpServer);
    } catch (error) {
      const err = new ServerError(
        'Failed to start GatewayService server',
        'GatewayService.startServer',
        'SERVER_START_FAILURE'
      );
      logger.error(err);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      logger.info(`Gateway server started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        logger.info(`Gateway server is running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      const err = new DependencyError(
        'Failed to bind HTTP port',
        'GatewayService.startHttpServer',
        'PORT_BIND_FAILURE'
      );
      logger.error(err);
    }
  }

}
