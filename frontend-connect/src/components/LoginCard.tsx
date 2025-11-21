import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useFormValidation } from "../hooks/useFormValidation";
import { loginSchema } from "../schemas/authSchemas";
import "./AuthCard.css";

interface LoginCredentials {
  identifier: string;
  password: string;
  cookieConsent?: boolean | null;
  marketingConsent?: boolean | null;
}

interface LoginCardProps {
  onLogin: (credentials: LoginCredentials) => void;
}

const LoginCard = ({ onLogin }: LoginCardProps) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { fieldErrors, validateField, clearFieldError } =
    useFormValidation(loginSchema);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    clearFieldError("identifier");
  };

  const handleIdentifierBlur = () => {
    validateField("identifier", identifier);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    clearFieldError("password");
  };

  const handlePasswordBlur = () => {
    validateField("password", password);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cookieConsent = localStorage.getItem("cookieConsent") === "true";
    const marketingConsent = localStorage.getItem("marketingConsent") === "true";

    try {
      setIsLoading(true);
      await onLogin({ identifier, password, cookieConsent, marketingConsent });
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Nom d’utilisateur ou e-mail</label>
          <input
            type="text"
            value={identifier}
            onChange={handleIdentifierChange}
            onBlur={handleIdentifierBlur}
            disabled={isLoading}
            required
          />
          {fieldErrors.identifier && (
            <div className="field-error">{fieldErrors.identifier}</div>
          )}
        </div>

        <div className="input-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            disabled={isLoading}
            required
          />
          {fieldErrors.password && (
            <div className="field-error">{fieldErrors.password}</div>
          )}
        </div>

        <p className="forgot-link" onClick={() => navigate("/Forget")}>
          Mot de passe oublié ?
        </p>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
};

export default LoginCard;
