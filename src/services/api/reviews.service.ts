import {AxiosService} from '../axios.service';

export class ReviewsService extends AxiosService {
  async queryReviews(params: Record<string, unknown>) {
    return this.request('get', `/reviews`, undefined, params);
  }

  async replyReview(body: unknown) {
    return this.request('patch', `/reviews/reply`, body);
  }

  async addReview(body: unknown) {
    return this.request('post', `/reviews`, body);
  }
}
