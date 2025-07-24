import { AxiosResponse } from 'axios';

import { AxiosService } from '../axios.service';

export class AuthService {
  private readonly axiosService: AxiosService;

  constructor(axiosService: AxiosService) {
    this.axiosService = axiosService;
  }

  async signUp(requestData: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/signup', requestData);
    return response;
  }

  async signIn(requestData: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/signin', requestData);
    return response;
  }

  async resendEmailVerification(requestData: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/resend-verification', requestData);
    return response;
  }

  async verifyEmail(requestData: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/verify-email', requestData);
    return response;
  }

  async refreshToken(requestData: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/refresh-token', requestData);
    return response;
  }

  async logout(requestData: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axios.post('/logout', requestData);
    return response;
  }
}
