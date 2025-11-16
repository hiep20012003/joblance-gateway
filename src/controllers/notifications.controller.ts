import {Request, Response, NextFunction} from 'express';
import {BaseController} from '@gateway/controllers/base.controller';
import {NotificationsService} from '@gateway/services/api/notifications.service';

export class NotificationsController extends BaseController {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  public getNotifications = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('notifications', 'user', 'get-by-user-id'),
      async (forwardedHeader) => {
        return this.notificationsService.setHeader(forwardedHeader).getNotifications(req.query);
      }
    );
  };

  public markNotificationAsRead = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('notifications', 'user', 'mark-as-read'),
      async (forwardedHeader) => {
        return this.notificationsService.setHeader(forwardedHeader).markNotificationAsRead(req.params.notificationId);
      }
    );
  };
}
