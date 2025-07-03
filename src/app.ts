import express, { Express } from 'express';
import { Logger } from '@hiep20012003/joblance-shared';

import { GatewayServer } from './server';

export const logger = new Logger('GatewayService');

class Application {
  public initialize(): void {
    const app: Express = express();
    const server: GatewayServer = new GatewayServer(app);
    server.start();
    logger.info('Gateway Service initialized');
  }
}

const application: Application = new Application();
application.initialize();
