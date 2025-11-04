import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { resetPassword } from  "../api/userService";
import { APIError } from '../api/apiWrapper';
import { useSearchParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Récupération du token depuis la query string
  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) setExpired(true); // Pas de token → lien invalide
    setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage("");
    if (!token) return setExpired(true);

    if (password !== confirm) return setError("Les mots de passe ne correspondent pas");
    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
      // Redirection automatique après 3 secondes
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err instanceof APIError) setError(err.message);
      else setError("Une erreur inattendue est survenue.");
    }
  };

  if (expired) {
    return (
      <div className="auth-card">
        <h2>Lien invalide ou expiré</h2>
        <p>Veuillez demander une nouvelle réinitialisation de mot de passe.</p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Réinitialiser le mot de passe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmez le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit">Mettre à jour</button>
      </form>
      {message && <p className="info">{message} Vous allez être redirigé vers la page de connexion...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ResetPassword;
