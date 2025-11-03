import { useState } from "react";
import type { FormEvent } from "react";
import { resetPassword } from  "../api/userService";
import { APIError } from '../api/apiWrapper';
import { useParams } from "react-router-dom";


function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams<{ token: string }>();


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas");
    try {
      const response = await resetPassword(token!, password);
      setMessage(response.message);
    } catch (err) {
      if (err instanceof APIError) setError(err.message);
      else setError("Une erreur inattendue est survenue.");
    }
  };
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
      {message && <p className="info">{message}</p>}
    </div>
  );
}

export default ResetPassword;
