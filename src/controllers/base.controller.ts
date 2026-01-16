import { Request, Response } from 'express';
import { AppLogger } from '@gateway/utils/logger';
import { generateInternalTokenHeader } from '@gateway/utils/helper';

export abstract class BaseController {

  protected buildOperation(service: string, entity: string, action: string): string {
    return `${service}:${entity}:${action}`;
  }

  /**
   * @param req Express request
   * @param res Express response
   * @param operation string operation name
   * @param serviceCall function returning ApiResponse
   * @param callback optional function to transform log context / metadata
   */
  protected async handleRequest(
    req: Request,
    res: Response,
    operation: string,
    serviceCall: (forwardedHeader: Record<string, string>)=> Promise<{ status: number, data: any }>,
    callback?: (response: { status: number, data: any })=> Promise<void>
  ) {
    // startTransaction();
    const start = process.hrtime.bigint();
    req.operation = operation;

    try {
      const internalToken = await generateInternalTokenHeader({ req });
      const headers = { 'x-internal-token': `${internalToken}`, 'x-forwarded-for': `${req.ip}`, 'authorization': `Bearer ${req?.session?.accessToken ?? ''}` };
      const response = await serviceCall(headers);

      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      req.durationMs = durationMs;

      if (callback) {
        await callback(response);
      }

      AppLogger.info('Request completed', {
        req, res,
        operation,
        context: {
          url: req.originalUrl,
          method: req.method,
          clientIp: req.ip,
          audience: req.audience,
          durationMs,
        },
      });

      res.status(response.status).json(response.data);
    } catch (err: unknown) {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      req.durationMs = durationMs;

      throw err;
    }
  }
}
