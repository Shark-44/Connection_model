// src/api/userService.tsx
import { apiCall } from './apiWrapper';
import { User, CreateReponse, LoginResponse } from "../types/types";


export const createUser = async (
    username: string,
    email: string,
    password: string
  ): Promise<CreateReponse> => {

    const userData = {
        username,
        email,
        password,
    };
    return apiCall<CreateReponse>('post', '/admin-user', {
      data: userData,
      errorNamespace: 'api.createuser.user',
    });
  };

  // 🔐 Connexion utilisateur (avec identifier)
export const login = async (
    identifier: string,
    password: string
  ): Promise<LoginResponse> => {
    const userData = {
      identifier,
      password,
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
  