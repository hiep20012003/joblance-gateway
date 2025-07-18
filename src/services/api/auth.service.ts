import { DependencyError, SignUpRequest } from '@hiep20012003/joblance-shared';
import { AxiosResponse } from 'axios';

import { AxiosService } from '../axios.service';

export class AuthService {
  private readonly axiosService: AxiosService;

  constructor(axiosService: AxiosService) {
    this.axiosService = axiosService;
  }

  async signUp(requestData: SignUpRequest): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await this.axiosService.axios.post('/signup', requestData);
      return response;
    } catch (error) {
      throw new DependencyError({
        clientMessage: 'Unable to process your request at the moment.',
        logMessage: 'POST /signup request to Auth Service failed',
        operation: 'auth-signup-request',
        cause: error
      });
    }
  }
}
