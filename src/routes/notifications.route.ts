import express, {Router} from 'express';
import {config} from '@gateway/config';
import {handleAsyncError} from '@hiep20012003/joblance-shared';
import {NotificationsService} from '@gateway/services/api/notifications.service';
import {NotificationsController} from '@gateway/controllers/notifications.controller';
import {authNotRefreshMiddleware} from '@gateway/middlewares/auth-not-refresh.middleware';

export class NotificationRoutes {
  private readonly notificationsController: NotificationsController;
  public router: Router;

  constructor() {
    const notificationsService = new NotificationsService(`${config.NOTIFICATIONS_BASE_URL}/api/v1`);
    this.notificationsController = new NotificationsController(notificationsService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'notifications';
      next();
    });

    // Notification
    this.router.get(
      '/notifications',
      authNotRefreshMiddleware,
      handleAsyncError(this.notificationsController.getNotifications)
    );
    this.router.post(
      '/notifications/:notificationId/read',
      authNotRefreshMiddleware,
      handleAsyncError(this.notificationsController.markNotificationAsRead)
    );

    return this.router;
  };
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();
