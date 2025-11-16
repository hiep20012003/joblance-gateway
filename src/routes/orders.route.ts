import express, {Router} from 'express';
import {config} from '@gateway/config';
import {
  ALL_GIG_DELIVERY_ALLOWED_MIMES,
  handleAsyncError,
  validateMultipleFiles
} from '@hiep20012003/joblance-shared';
import {OrdersService} from '@gateway/services/api/orders.service';
import {OrdersController} from '@gateway/controllers/orders.controller';
import multer from 'multer';
import {authNotRefreshMiddleware} from '@gateway/middlewares/auth-not-refresh.middleware';

export class OrderRoutes {
  private readonly orderController: OrdersController;
  public router: Router;

  constructor() {
    const orderService = new OrdersService(`${config.ORDERS_BASE_URL}/api/v1`);
    this.orderController = new OrdersController(orderService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'orders';
      next();
    });

    const upload = multer({storage: multer.memoryStorage()});

    /**
     * ========================
     *        ORDERS
     * ========================
     */

    this.router.post(
      '/orders',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.createOrder)
    );

    this.router.get(
      '/orders',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.getOrders)
    );

    this.router.get(
      '/orders/:orderId',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.getOrderById)
    );

    this.router.post(
      '/orders/:orderId/requirements',
      authNotRefreshMiddleware,
      upload.array('requirementFiles', 10),
      validateMultipleFiles(ALL_GIG_DELIVERY_ALLOWED_MIMES),
      handleAsyncError(this.orderController.submitOrderRequirements)
    );

    this.router.post(
      '/orders/:orderId/deliveries',
      authNotRefreshMiddleware,
      upload.array('deliveryFiles', 5),
      validateMultipleFiles(ALL_GIG_DELIVERY_ALLOWED_MIMES),
      handleAsyncError(this.orderController.deliverOrder)
    );

    this.router.post(
      '/orders/:orderId/deliveries/approve',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.approveOrderDelivery)
    );

    this.router.post(
      '/orders/:orderId/deliveries/revise',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.requestRevision)
    );

    this.router.post(
      '/orders/:orderId/cancel',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.cancelOrder)
    );

    /**
     * ========================
     *        PAYMENTS
     * ========================
     */

    this.router.post(
      '/payments/preview',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.previewPayment)
    );

    this.router.post(
      '/orders/:orderId/payments',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.createPayment)
    );

    this.router.get(
      '/orders/:orderId/payments',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.getPaymentsByOrder)
    );

    this.router.post(
      '/payments/validate',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.validatePayment)
    );

    this.router.post(
      '/webhooks/stripe',
      express.raw({type: 'application/json'}),
      handleAsyncError(this.orderController.stripeWebhook)
    );

    /**
     * ========================
     *     NEGOTIATIONS
     * ========================
     */

    this.router.post(
      '/negotiations',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.createNegotiation)
    );

    this.router.get(
      '/negotiations/:negotiationId',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.getNegotiationById)
    );

    this.router.post(
      '/negotiations/:negotiationId/approve',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.approveNegotiation)
    );

    this.router.post(
      '/negotiations/:negotiationId/reject',
      authNotRefreshMiddleware,
      handleAsyncError(this.orderController.rejectNegotiation)
    );

    return this.router;
  };
}

export const orderRoutes: OrderRoutes = new OrderRoutes();
