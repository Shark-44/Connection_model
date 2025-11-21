import { useState } from "react";
import { login as apiLogin } from "../api/userService";
import { APIError } from "../api/apiWrapper";

export const useLogin = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: any) => {
    setLoading(true);
    setError(null);

    try {
      const { identifier, password } = credentials;
      const result = await apiLogin(identifier, password);
      return result;

    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("Erreur inattendue");
      }
      throw err;

    } finally {
      setLoading(false);
    }
  };

  return { login, isLoading, error };
};
