// src/services/authService.ts
import { apiCall } from './apiWrapper';

export const refreshToken = async (): Promise<void> => {
  try {
    await apiCall('post', '/refresh-token', {
      errorNamespace: 'api.auth',
      retry: true, // Évite la boucle infinie
    });
  } catch (error) {
    console.error('Refresh token échoué', error);
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
};
