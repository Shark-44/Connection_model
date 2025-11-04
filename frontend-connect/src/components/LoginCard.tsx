// src/components/LoginCards.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { APIError } from '../api/apiWrapper';
import { useNavigate } from "react-router-dom";




import "./AuthCard.css";

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface LoginCardProps {
  onLogin: (credentials: LoginCredentials) => void;
}

const LoginCard = ({ onLogin }: LoginCardProps) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onLogin({ identifier, password });
    } catch (err) {
      
      if (err instanceof APIError) {
        // Affiche le message d'erreur déjà traduit par apiCall
        
        setError(err.message);
        
      } else {
        setError("Une erreur inattendue est survenue.");
      }
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
            placeholder="Nom d’utilisateur ou e-mail"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <p className="forgot-link" onClick={() => navigate("/Forget")}>
            Mot de passe oublié ?
        </p>
        {error && (
          <div key={error} className="error-message">
            {error}
          </div>
        )}
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default LoginCard;

