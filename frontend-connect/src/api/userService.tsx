import { apiCall } from './apiWrapper';
import { User } from "../types/types";

export const login = async (
    name: string,
    password: string
): Promise<User> => {
    const userData = {
        name,
        password,
    }
    return apiCall<User>('post', '/connexion', {
        data: userData,
        errorNamespace: '{lang}.api.login.user',
    });
};
export const logout = async (): Promise<User> => {

    return apiCall<User>('get', '/connexion', {
        errorNamespace: '{lang}.api.logout.user',
    });
};

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