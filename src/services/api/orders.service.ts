import {AxiosService} from '../axios.service';

export class OrdersService extends AxiosService {

  async createOrder(data: unknown) {
    return this.request('post', `/orders`, data);
  }

  async previewPayment(data: unknown) {
    return this.request('post', `/payments/preview`, data);
  }

  async submitOrderRequirements(orderId: string, data: unknown) {
    return this.request('post', `/orders/${orderId}/requirements`, data);
  }


  async deliverOrder(orderId: string, data: unknown) {
    return this.request('post', `/orders/${orderId}/deliveries`, data);
  }

  async getOrderById(orderId: string) {
    return this.request('get', `/orders/${orderId}`);
  }

  async getOrders(query: Record<string, unknown>) {
    return this.request('get', `/orders`, undefined, query);
  }

  async createNegotiation(data: unknown) {
    return this.request('post', `/negotiations`, data);
  }

  async getNegotiationById(id: string) {
    return this.request('get', `/negotiations/${id}`);
  }

  async rejectNegotiation(negotiationId: string, body: unknown) {
    return this.request('post', `/negotiations/${negotiationId}/reject`, body);
  }

  async approveNegotiation(negotiationId: string, body: unknown) {
    return this.request('post', `/negotiations/${negotiationId}/approve`, body);
  }

  async approveOrderDelivery(orderId: string) {
    return this.request('post', `/orders/${orderId}/deliveries/approve`);
  }

  async requestRevision(orderId: string) {
    return this.request('post', `/orders/${orderId}/deliveries/revise`);
  }

  async cancelOrder(orderId: string) {
    return this.request('post', `/orders/${orderId}/cancel`);
  }

  async createPayment(orderId: string, data: unknown) {
    return this.request('post', `/orders/${orderId}/payments`, data);
  }

  async getPaymentsByOrder(orderId: string) {
    return this.request('get', `/orders/${orderId}/payments`);
  }

  async validatePayment(payload: unknown) {
    return this.request('post', `/payments/validate`, payload);
  }

  async stripeWebhook(body: unknown) {
    return this.request('post', `/webhooks/stripe`, body, {});
  }
}
