import { useState } from "react";
import { z } from "zod";

interface FieldErrors {
  [key: string]: string | undefined;
}

interface UseFormValidationReturn<T extends z.ZodTypeAny> {
  fieldErrors: FieldErrors;
  validateField: (field: string, value: any) => boolean;
  validateAll: (data: Record<string, any>) => boolean;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
}

/**
 * Hook générique pour la validation de formulaire avec Zod
 */
export const useFormValidation = <T extends z.ZodTypeAny>(
  schema: T
): UseFormValidationReturn<T> => {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /**
   * Valide un champ spécifique
   */
  const validateField = (field: string, value: any): boolean => {
    // Si le schéma est un ZodObject, on valide le champ individuel
    if (schema instanceof z.ZodObject) {
      const fieldSchema = schema.shape[field];
      
      if (!fieldSchema) {
        console.warn(`Field "${field}" not found in schema`);
        return true;
      }

      const result = fieldSchema.safeParse(value);

      if (!result.success) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: result.error.issues[0].message,
        }));
        return false;
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
        return true;
      }
    }

    return true;
  };

  /**
   * Valide toutes les données du formulaire
   */
  const validateAll = (data: Record<string, any>): boolean => {
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrorsMap: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrorsMap[field]) {
          fieldErrorsMap[field] = issue.message;
        }
      });
      setFieldErrors(fieldErrorsMap);
      return false;
    } else {
      setFieldErrors({});
      return true;
    }
  };

  /**
   * Efface l'erreur d'un champ spécifique
   */
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  /**
   * Efface toutes les erreurs
   */
  const clearAllErrors = () => {
    setFieldErrors({});
  };

  return {
    fieldErrors,
    validateField,
    validateAll,
    clearFieldError,
    clearAllErrors,
  };
};