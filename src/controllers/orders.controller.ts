import {Request, Response, NextFunction} from 'express';
import {OrdersService} from '@gateway/services/api/orders.service';
import {createFormData, generateInternalTokenHeader} from '@gateway/utils/helper';
import {BaseController} from '@gateway/controllers/base.controller';

export class OrdersController extends BaseController {
  constructor(private readonly orderService: OrdersService) {
    super();
  }

  // ORDER

  public getOrderById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'get-by-id'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).getOrderById(req.params.orderId);
      }
    );
  };

  public getOrders = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'get-all'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).getOrders(req.query);
      }
    );
  };

  public createOrder = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'create'),
      async (forwardedHeader) => {
        return this.orderService.setHeader(forwardedHeader).createOrder(req.body);
      }
    );
  };

  public submitOrderRequirements = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'submit-requirements'),
      async (forwardedHeader) => {
        const formData = createFormData(req);

        return this.orderService.setHeader(forwardedHeader).submitOrderRequirements(req.params.orderId, formData);
      }
    );
  };

  public deliverOrder = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'deliver'),
      async (forwardedHeader) => {
        const formData = createFormData(req);

        return this.orderService.setHeader(forwardedHeader).deliverOrder(req.params.orderId, formData);
      }
    );
  };

  public approveOrderDelivery = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'approve'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).approveOrderDelivery(req.params.orderId);
      }
    );
  };

  public requestRevision = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'approve'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).requestRevision(req.params.orderId);
      }
    );
  };

  public cancelOrder = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'cancel'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).cancelOrder(req.params.orderId);
      }
    );
  };

  // PAYMENT

  public createPayment = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'payment', 'create'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).createPayment(req.params.orderId, req.body);
      }
    );
  };

  public previewPayment = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'order', 'preview'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).previewPayment(req.body);
      }
    );
  };

  public getPaymentsByOrder = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'payment', 'get-by-order'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).getPaymentsByOrder(req.params.orderId);
      }
    );
  };

  public validatePayment = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'payment', 'validate'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).validatePayment(req.body);
      }
    );
  };

  public stripeWebhook = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const buffer = Buffer.from(req.rawBody);
    const internalToken = await generateInternalTokenHeader({req});
    const headers = {
      'stripe-signature': req.headers['stripe-signature'] as string,
      'Content-Type': 'application/octet-stream',
      'Content-Length': `${buffer.length}`,
      'x-internal-token': `${internalToken}`
    };
    const response = await this.orderService.setHeader(headers).stripeWebhook(req.rawBody);
    res.status(200).json(response);
  };

  // NEGOTIATION

  public getNegotiationById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'request-extension', 'create'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).getNegotiationById(req.params.negotiationId);
      }
    );
  };

  public createNegotiation = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'request-extension', 'create'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).createNegotiation(req.body);
      }
    );
  };


  public rejectNegotiation = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'negotiation', 'update'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).rejectNegotiation(
          req.params.negotiationId, req.body
        );
      }
    );
  };

  public approveNegotiation = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('orders', 'negotiation', 'update'),
      async (forwardedHeader) => {

        return this.orderService.setHeader(forwardedHeader).approveNegotiation(
          req.params.negotiationId, req.body
        );
      }
    );
  };
}
