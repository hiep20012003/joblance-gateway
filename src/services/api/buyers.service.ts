import FormData from 'form-data';

import {AxiosService} from '../axios.service';

export class BuyersService extends AxiosService {

  async getBuyerById(buyerId: string) {
    return this.request('get', `/buyers/${buyerId}`);
  }

  async getBuyerByUsername(username: string) {
    return this.request('get', `/buyers/username/${username}`);
  }

  async getBuyerByEmail(email: string) {
    return this.request('get', `/buyers/email/${email}`);
  }

  async getBuyers(query: Record<string, unknown>) {
    return this.request('get', `/buyers`, undefined, query);
  }

  async updateBuyerById(buyerId: string, data: FormData) {
    return this.request('patch', `/buyers/${buyerId}`, data);
  }
}
