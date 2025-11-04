import { useState } from "react";
import type { FormEvent } from "react";
import { forgotPassword } from "../api/userService";
import { APIError } from '../api/apiWrapper';


function Forgot() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await forgotPassword(email);
      setMessage(response.message); // ou texte fixe "Email envoyé si compte existant"
    } catch (err) {
      if (err instanceof APIError) setError(err.message);
      else setError("Une erreur inattendue est survenue.");
    }
  };

  return (
    <div className="auth-card">
      <h2>Mot de passe oublié</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Envoyer le lien</button>
      </form>
      {message && <p className="info">{message}</p>}
    </div>
  );
}

export default Forgot;
