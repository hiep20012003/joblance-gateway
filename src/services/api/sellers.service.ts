import {AxiosService} from '../axios.service';

export class SellersService extends AxiosService {

  async createSeller(userId: string, payload: unknown) {
    return this.request('post', `/sellers/${userId}`, payload);
  }

  async updateSeller(sellerId: string, payload: unknown) {
    return this.request('patch', `/sellers/${sellerId}`, payload);
  }

  async getSellerById(sellerId: string) {
    return this.request('get', `/sellers/${sellerId}`);
  }

  async getSellerByUsername(username: string) {
    return this.request('get', `/sellers/username/${username}`);
  }

  async getSellers(query: Record<string, unknown>) {
    return this.request('get', `/sellers`, undefined, query);
  }

  async getTopSellers(query: Record<string, unknown>) {
    return this.request('get', `/sellers/top`, undefined, query);
  }
}
