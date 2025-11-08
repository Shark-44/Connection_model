// src/api/verifyService.ts
import { apiCall } from './apiWrapper';

export interface VerifyResponse {
  success: boolean;
  message: string;
}

export const Verifyservice = async (
  email: string,
  otp: string
): Promise<VerifyResponse> => {
  const userData = {
    email,
    otp,
  };

  return apiCall<VerifyResponse>('post', '/auth-verify/verify', {
    data: userData,
    errorNamespace: 'api.verify.user',
  });
};

export const ResendOTPService = async (
  email: string,

): Promise<VerifyResponse> => {
  const userData = {
    email,
  
  };

  return apiCall<VerifyResponse>('post', '/auth-verify/resend', {
    data: userData,
    errorNamespace: 'api.verify.user',
  });
};
