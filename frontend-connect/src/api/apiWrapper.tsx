// src/api/apiWrapper.ts
import { AxiosError, AxiosRequestConfig } from 'axios';
import i18n from '../i18n';
import api from './axiosInstance';
import errors from '../Locales/errors.json';


export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}


export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  options?: {
    data?: any;
    params?: any;
    config?: AxiosRequestConfig;
    errorNamespace?: string;
  }
) {
  try {
    const response = await api[method]<T>(
      endpoint,
      options?.data,
      options?.config
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    let errorMessage: string;
    if (!axiosError.response) {
      errorMessage = i18n.t(errors.api.common.network_error);
    } else {
      switch (axiosError.response.status) {
        case 404:
          errorMessage = i18n.t(`${options?.errorNamespace}.not_found`);
          break;
        case 500:
          errorMessage = i18n.t(`${options?.errorNamespace}.server_error`);
          break;
        default:
          errorMessage = i18n.t(`${options?.errorNamespace}.default_error`);
      }
    }
    console.error('API Error:', {
      endpoint,
      status: axiosError.response?.status,
      message: errorMessage,
      originalError: axiosError
    });
    throw new APIError(
      errorMessage,
      axiosError.response?.status,
      `${method.toUpperCase()}_${endpoint.toUpperCase()}_ERROR`
    );
  }
}