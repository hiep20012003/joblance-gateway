import {Request, Response, NextFunction} from 'express';
import {BaseController} from '@gateway/controllers/base.controller';

// const SERVICE_URLS = {
//   auth: config.AUTH_BASE_URL,
//   users: config.USERS_BASE_URL,
//   gigs: config.GIGS_BASE_URL,
//   orders: config.ORDERS_BASE_URL,
//   chats: config.CHATS_BASE_URL,
//   notification: config.NOTIFICATIONS_BASE_URL
//   // add other services
// };

export class HealthController extends BaseController {
  constructor() {
    super();
  }

  public health = async (_req: Request, _res: Response, _next: NextFunction): Promise<void> => {
    // await this.handleRequest(
    //   req,
    //   res,
    //   this.buildOperation('health', 'gateway', 'check-all-services'),
    //   async (forwardedHeader) => {
    //     const results: Record<string, string> = {};
    //
    //     await Promise.all(
    //       Object.entries(SERVICE_URLS).map(async ([service, url]) => {
    //         try {
    //           const resp = await axios.get(`${url}/health`);
    //           results[service] = resp.status === 200 ? 'healthy' : `unhealthy (${resp.status})`;
    //         } catch {
    //           results[service] = 'unreachable';
    //         }
    //       })
    //     );
    //
    //     const allHealthy = Object.values(results).every(status => status === 'healthy');
    //
    //     return new SuccessResponse({
    //       message: allHealthy ? 'All services are healthy' : 'Some services are down',
    //       statusCode: allHealthy ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE,
    //       reasonPhrase: allHealthy ? ReasonPhrases.OK : ReasonPhrases.SERVICE_UNAVAILABLE,
    //       metadata: results,
    //     });
    //   }
    // );
  };
}
