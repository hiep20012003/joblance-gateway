import express, { Express } from 'express';
import { GatewayServer } from '@gateway/server';
import { AppLogger } from '@gateway/utils/logger';

class Application {
  private app: Express;
  private server: GatewayServer;

  constructor() {
    this.app = express();
    this.server = new GatewayServer(this.app);
  }

  public async initialize(): Promise<void> {
    const operation = 'gateway-service-init';

    try {
      await this.server.start();
      AppLogger.info('Gateway Service initialized', { operation });
    } catch (error) {
      AppLogger.error('', { operation, error });
      process.exit(1);
    }
  }
}

async function bootstrap(): Promise<void> {
  const application = new Application();
  await application.initialize();
}

// ---- Global error handlers ---- //
process.on('uncaughtException', (error) => {
  AppLogger.error('', { operation: 'gateway-service-uncaught-exception', error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  AppLogger.error('', { operation: 'gateway-service-unhandled-rejection', error: reason });
  process.exit(1);
});

// ---- App Entry Point ---- //
bootstrap().catch((error) => {
  AppLogger.error('', { operation: 'gateway-service-bootstrap-failed', error });
  process.exit(1);
});
