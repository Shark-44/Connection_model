// src/components/LoginCards.tsx
import { useState } from "react";
import type { FormEvent } from "react";
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin({ identifier, password });
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
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default LoginCard;

