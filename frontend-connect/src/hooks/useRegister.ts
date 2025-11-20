import { useState } from "react";
import { registerSchema, type RegisterFormData } from "../schemas/authSchemas";
import { createUser } from "../api/userService";
import { APIError } from "../api/apiWrapper";
import { z } from "zod";

interface UseRegisterReturn {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  register: (data: RegisterFormData) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

/**
 * Hook personnalisé pour gérer la logique d'inscription
 */
export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Validation des données avec Zod
      const validatedData = registerSchema.parse(data);

      // Récupération des consentements depuis localStorage
      const cookieConsentLS = localStorage.getItem("cookieConsent");
      const marketingConsentLS = localStorage.getItem("marketingConsent");

      const cookieConsent =
        cookieConsentLS !== null ? cookieConsentLS === "true" : null;
      const marketingConsent =
        marketingConsentLS !== null ? marketingConsentLS === "true" : null;

      // Appel API
      await createUser(
        validatedData.username,
        validatedData.email,
        validatedData.password,
        cookieConsent,
        marketingConsent
      );

      setIsSuccess(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Erreur de validation Zod
        const zodError = err as z.ZodError<RegisterFormData>;
        setError(zodError.issues[0].message);
      } else if (err instanceof APIError) {
        // Erreur API
        setError(err.message);
      } else {
        // Erreur inattendue
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  
  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  };

  return {
    isLoading,
    error,
    isSuccess,
    register,
    clearError,
    resetState,
  };
};