import {Application} from 'express';
import {healthRoutes} from '@gateway/routes/health.route';
import {authRoute} from '@gateway/routes/auth.route';
import {adminRoute} from '@gateway/routes/admin.route';
import {buyerRoutes} from '@gateway/routes/buyers.route';
import {sellerRoutes} from '@gateway/routes/sellers.route';
import {gigRoutes} from '@gateway/routes/gigs.route';
import {searchRoutes} from '@gateway/routes/search.route';
import {orderRoutes} from '@gateway/routes/orders.route';
import {notificationRoutes} from '@gateway/routes/notifications.route';
import {messageRoutes} from '@gateway/routes/messages.route';
import seedRoutes from '@gateway/routes/seed.route';
import {reviewRoutes} from '@gateway/routes/reviews.route';

const BASE_PATH = '/api/v1';
export const appRoutes = (app: Application) => {
  app.use(BASE_PATH, healthRoutes.routes());
  app.use(BASE_PATH, searchRoutes.routes());
  app.use(BASE_PATH, authRoute.routes());
  app.use(BASE_PATH, buyerRoutes.routes());
  app.use(BASE_PATH, sellerRoutes.routes());
  app.use(BASE_PATH, gigRoutes.routes());
  app.use(BASE_PATH, orderRoutes.routes());
  app.use(BASE_PATH, reviewRoutes.routes());
  app.use(BASE_PATH, notificationRoutes.routes());
  app.use(BASE_PATH, messageRoutes.routes());
  app.use(BASE_PATH, adminRoute.routes());
  app.use('/seed', seedRoutes);
};
