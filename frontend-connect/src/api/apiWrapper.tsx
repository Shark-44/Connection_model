// src/api/apiWrapper.ts
import { AxiosError, AxiosRequestConfig } from 'axios';
import i18n from '../i18n.ts';
import api from './axiosInstance';



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
    const namespace = options?.errorNamespace || 'api.common';

    if (!axiosError.response) {
      errorMessage = i18n.t(`${namespace}.network_error`);
    } else {
      const status = axiosError.response.status;
      const errorKey = `${namespace}.${status}`;
      
      try {
        errorMessage = i18n.t(errorKey);
        
      } catch (e) {
        errorMessage = i18n.t(`${namespace}.default_error`);
      }
    }

    console.error('API Error:', {
      endpoint,
      status: axiosError.response?.status,
      message: errorMessage,
      originalError: axiosError,
    });

    throw new APIError(
      errorMessage,
      axiosError.response?.status,
      `${method.toUpperCase()}_${endpoint.toUpperCase()}_ERROR`
    );
  }
}
