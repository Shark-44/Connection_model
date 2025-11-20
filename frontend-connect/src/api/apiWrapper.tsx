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
    let response;
    
    // 🔧 Adapter les paramètres selon la méthode HTTP
    if (method === 'get' || method === 'delete') {
      response = await api[method]<T>(endpoint, {
        params: options?.params,
        ...options?.config,
      });
    } else {
      response = await api[method]<T>(endpoint, options?.data, {
        params: options?.params,
        ...options?.config,
      });
    }
    
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

    // 🐛 Debug logs
    /*console.log('🔍 Status reçu:', status, 'Type:', typeof status);
    console.log('🔍 Retry flag:', options?.retry);
    console.log('🔍 Response data:', axiosError.response.data);*/

    // 🎯 Gestion automatique du refresh token (498 uniquement)
    if (status === 498 && !options?.retry) {
      try {
        console.log('🔄 498 détecté → Token expiré, tentative de refresh');
        await refreshToken();
        
        console.log('✅ Refresh réussi, relance de la requête initiale');
        // Refaire la requête initiale avec retry=true
        return apiCall<T>(method, endpoint, { ...options, retry: true });
      } catch (refreshError) {
        console.error('❌ Refresh token échoué:', refreshError);
        throw new APIError(
          'Session expirée. Veuillez vous reconnecter.',
          498,
          'REFRESH_FAILED'
        );
      }
    }

    // 🚫 Token invalide/révoqué → rediriger vers login
    if (status === 499) {
      console.error('❌ 499 détecté → Token invalide/révoqué');
      throw new APIError(
        'Votre session est invalide. Veuillez vous reconnecter.',
        499,
        'TOKEN_INVALID'
      );
    }

    // ⚠️ 401 classique (login échoué, etc.) → pas de retry
    if (status === 401) {
      errorMessage = i18n.t(`${namespace}.401`) || 'Non autorisé';
      throw new APIError(errorMessage, 401, 'UNAUTHORIZED');
    }

    // Traduction des erreurs normales
    try {
      errorMessage = i18n.t(`${namespace}.${status}`);
    } catch {
      errorMessage = i18n.t(`${namespace}.default_error`) || 'Une erreur est survenue';
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