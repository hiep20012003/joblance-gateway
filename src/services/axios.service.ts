import {ApiResponse} from '@gateway/types/axios-respose';
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AppLogger} from '@gateway/utils/logger';
import FormData from 'form-data';
import {generateInternalTokenHeader} from '@gateway/utils/helper';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export abstract class AxiosService {
  // Axios instance
  protected readonly axiosInstance: AxiosInstance;
  private tempHeaders: Record<string, string> = {}; // temporary headers for next request
  private defaultHeaders: Record<string, string> = {}; // default headers for all requests

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({baseURL: baseUrl, withCredentials: true});
  }

  // Set temporary headers
  public setHeader(headers: Record<string, string>): this {
    this.tempHeaders = {...headers, ...this.tempHeaders};
    return this;
  }

  // Set default headers
  public setDefaultHeader(headers: Record<string, string>): this {
    this.defaultHeaders = {...this.defaultHeaders, ...headers};
    return this;
  }

  // Make request with optional data and query params
  protected async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    params?: Record<string, unknown>,
    retry = true
  ): Promise<{ status: number, data: T }> {

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        method,
        url,
        data,
        params: params
          ? Object.fromEntries(
            Object.entries(params).map(([key, value]) => {
              if (Array.isArray(value)) return [key, JSON.stringify(value)];
              return [key, value as string];
            })
          )
          : undefined,
        paramsSerializer: (params) => new URLSearchParams(params).toString(),
        headers: {
          ...this.defaultHeaders,
          ...(data instanceof FormData ? data.getHeaders() : {}),
          ...this.tempHeaders
        }
      });

      this.tempHeaders = {};
      return {status: response.status, data: response.data};
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorCode = (error.response?.data as ApiResponse)?.errorCode;

        if (retry && error.response?.status === 401 && errorCode === 'TOKEN_EXPIRED') {
          AppLogger.info('Refresh internal token', {operation: 'server:refresh-internal-token'});
          const token = this.tempHeaders['x-internal-token'];
          this.tempHeaders = {};
          const internalToken = await generateInternalTokenHeader({retryToken: token});
          return this.setHeader({
            'X-Internal-Token': `${internalToken}`
          }).request<T>(method, url, data, params, false);
        } else {
          throw error;
        }
      }
      throw error;
    }
  }
}
