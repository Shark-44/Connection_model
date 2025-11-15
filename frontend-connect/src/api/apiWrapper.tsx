// apiWrapper.ts
import { AxiosError, AxiosRequestConfig } from 'axios';
import i18n from '../i18n.ts';
import api from './axiosInstance';
import { refreshToken } from './authService';

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
    retry?: boolean;
  }
): Promise<T> {
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

    // Pas de réponse → problème réseau
    if (!axiosError.response) {
      errorMessage = i18n.t(`${namespace}.network_error`);
      console.error('API Network Error:', endpoint, axiosError);
      throw new APIError(errorMessage);
    }

    const status = axiosError.response.status;

    // Gestion automatique du refresh token
    if (status === 401 && !options?.retry) {
      try {
        console.log('401 détecté → tentative de refresh token');
        await refreshToken();
        // Refaire la requête initiale avec retry=true
        return apiCall<T>(method, endpoint, { ...options, retry: true });
      } catch (refreshError) {
        console.error('Refresh token échoué', refreshError);
        throw new APIError(
          'Session expirée. Veuillez vous reconnecter.',
          401,
          'REFRESH_FAILED'
        );
      }
    }

    // Traduction des erreurs normales
    try {
      errorMessage = i18n.t(`${namespace}.${status}`);
    } catch {
      errorMessage = i18n.t(`${namespace}.default_error`);
    }

    console.error('API Error:', {
      endpoint,
      status,
      message: errorMessage,
      originalError: axiosError,
    });

    throw new APIError(
      errorMessage,
      status,
      `${method.toUpperCase()}_${endpoint.toUpperCase()}_ERROR`
    );
  }
}
