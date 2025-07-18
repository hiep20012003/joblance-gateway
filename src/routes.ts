import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health.route';

import { authRoute } from './routes/auth.route';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use('/auth', authRoute.routes());
};
