// src/services/authService.ts
import { apiCall } from './apiWrapper';

export const refreshToken = async (): Promise<void> => {
  try {
    // ✅ Pas de retry: true ici, c'est l'endpoint de refresh lui-même
    await apiCall('post', '/refresh-token', {
      errorNamespace: 'api.auth',
      // On NE met PAS retry: true ici car c'est déjà l'endpoint de refresh
    });
    console.log('✅ Refresh token réussi');
  } catch (error) {
    console.error('❌ Refresh token échoué', error);
    // Optionnel : rediriger vers /login ou afficher une modal
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
};