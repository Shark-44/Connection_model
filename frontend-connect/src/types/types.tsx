// Utilisateur

export interface User {
  marketingConsent: null;
  cookieConsent: null;
  id: number;         
  username: string;    
  email: string;       
  password: string;
  created_at?: string; 
  updated_at?: string; 
}

export interface LoginResponse {
  message: string;
  user: User;
  cookie_consent?: boolean | null;
  marketing_consent?: boolean | null;
  
}

export interface CreateReponse {
  message: string;
  user: User;
}

export interface Reponse {
  email: string;
  opt: string;
}

export interface RepUpconsent {
  userId: number;
  cookieConsent: boolean;
  marketingConsent: boolean;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  cookieConsent?: boolean | null;
  marketingConsent?: boolean | null;
}
