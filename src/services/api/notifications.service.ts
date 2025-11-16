import {AxiosService} from '../axios.service';

export class NotificationsService extends AxiosService {
  async getNotifications(params: Record<string, unknown>) {
    return this.request('get', `/notifications`, undefined, params);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request('post', `/notifications/${notificationId}/read`);
  }
}
