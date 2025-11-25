import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// const SERVICE_URLS = {
//   auth: config.AUTH_BASE_URL,
//   users: config.USERS_BASE_URL,
//   gigs: config.GIGS_BASE_URL,
//   orders: config.ORDERS_BASE_URL,
//   chats: config.CHATS_BASE_URL,
//   notification: config.NOTIFICATIONS_BASE_URL
//   // add other services
// };

export class HealthController {
  public health = (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(StatusCodes.OK).send('Gateway Service is healthy and OK');
  };
}
