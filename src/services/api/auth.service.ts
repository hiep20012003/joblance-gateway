import {AxiosService} from '@gateway/services/axios.service';
import {IAuth} from '@hiep20012003/joblance-shared';

export class AuthService extends AxiosService {

  async getUserById(userId: string) {
    return this.request('get', `/users/${userId}`);
  }

  async signUp(payload: IAuth) {
    return this.request('post', '/users', payload);
  }

  async login(payload: IAuth) {
    return this.request('post', '/login', payload);
  }

  async refreshToken(refreshToken: string) {
    return this.request('post', '/refresh', {token: refreshToken});
  }

  async logout() {
    return await this.request('post', `/logout`);
  }

  async changePassword(payload: unknown) {
    return this.request('post', `/users/password/change`, payload);
  }

  async forgotPassword(email: string) {
    return this.request('post', '/tokens/password', {email});
  }

  async validateResetPasswordToken(token: string) {
    return this.request('post', `/tokens/password/validate`, {token});
  }

  async resetPassword(payload: unknown) {
    return this.request('post', `/users/password/reset`, payload);
  }

  async resendEmailVerification(email: string) {
    return this.request('post', '/tokens/email/resend', {email});
  }

  async verifyEmail(payload: unknown) {
    return this.request('post', `/users/email/verify`, payload);
  }


}
