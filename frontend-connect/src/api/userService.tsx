import { apiCall } from './apiWrapper';
import { User, CreateReponse, LoginResponse } from "../types/types";

// ✅ Inscription avec consentements
export const createUser = async (
  username: string,
  email: string,
  password: string,
  cookieConsent: boolean | null = null,
  marketingConsent: boolean | null = null
): Promise<CreateReponse> => {
  const userData = {
    username,
    email,
    password,
    cookieConsent,
    marketingConsent,
  };
  console.log("Payload create envoyé :", userData);
  return apiCall<CreateReponse>('post', '/admin-user', {
    data: userData,
    errorNamespace: 'api.createuser.user',
  });
};

// ✅ Connexion (le consentement est retourné par le backend)
export const login = async (
  identifier: string,
  password: string,
  cookieConsent: boolean | null = null,
  marketingConsent: boolean | null = null
): Promise<LoginResponse> => {
  const userData = {
    identifier,
    password,
    cookieConsent,
    marketingConsent,
  };
    return apiCall<LoginResponse>('post', '/login', {
    data: userData,
    errorNamespace: 'api.login.user',
  });
};


// 🚪 Déconnexion 
export const logout = async (): Promise<User> => {
  return apiCall<User>('post', '/logout', {
    errorNamespace: 'api.logout.user',
  });
};

// ✅ Mettre à jour le consentement (nouveau)
export const updateConsent = async (
  cookieConsent: boolean,
  marketingConsent: boolean
): Promise<{ success: boolean; consent: { cookie_consent: boolean; marketing_consent: boolean } }> => {
  return apiCall<{ success: boolean; consent: { cookie_consent: boolean; marketing_consent: boolean } }>(
    'post',
    '/consent/update-consent',
    {
      data: { cookieConsent, marketingConsent },
      errorNamespace: 'api.updateConsent.user',
    }
  );
};
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>('post', '/auth/forgot-password', {
    data: { email },
    errorNamespace: 'api.forgotPassword.user',
  });
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>('post', '/auth/reset-password', {
    data: { token, password },
    errorNamespace: 'api.resetPassword.user',
  });
};
