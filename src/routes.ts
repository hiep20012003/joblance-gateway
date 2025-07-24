import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health.route';
import { authRoute } from '@gateway/routes/auth.route';

const BASE_PATH = '/api/gateway/v1';
export const appRoutes = (app: Application) => {
  app.use(BASE_PATH, healthRoutes.routes());
  app.use(BASE_PATH, authRoute.routes());
};
