// src/api/userService.tsx
import { apiCall } from './apiWrapper';
import { User, LoginResponse } from "../types/types";


export const createUser = async (
    username: string,
    email: string,
    password: string
  ): Promise<User> => {

    const userData = {
        username,
        email,
        password,
    };
    return apiCall<User>('post', '/admin-user', {
      data: userData,
      errorNamespace: '.api.createuser.user',
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
      errorNamespace: '{lang}.api.login.user',
    });
  };
  
  // 🚪 Déconnexion
  export const logout = async (): Promise<User> => {
    return apiCall<User>('post', '/logout', {
      errorNamespace: '{lang}.api.logout.user',
    });
  };