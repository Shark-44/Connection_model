import { useState, type FormEvent } from "react";
import { createUser } from "../api/userService";
import { APIError } from '../api/apiWrapper';
import zxcvbn from "zxcvbn";
import "./AuthCard.css";

const RegisterCard = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/[<>]/.test(value)) {
      setPassword(value);
      if (!passwordTouched && value.length > 0) {
        setPasswordTouched(true);
      }
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    try {
           // ✅ Récupération du consentement depuis localStorage
           const cookieConsentLS = localStorage.getItem("cookieConsent");
           const marketingConsentLS = localStorage.getItem("marketingConsent");
     
           const cookieConsent = cookieConsentLS !== null ? cookieConsentLS === "true" : null;
           const marketingConsent = marketingConsentLS !== null ? marketingConsentLS === "true" : null;
     
      await createUser(username.trim(), email, password, cookieConsent, marketingConsent);
      setOpenPopup(true);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    }
  };

  const closePopUp = () => {
    setOpenPopup(false);
  };

  return (
    <div className="auth-card">
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => {
              const value = e.target.value.trimStart();
              if (!/[<>]/.test(value)) setUsername(value);
            }}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              if (!e.target.value.includes(">") && !e.target.value.includes("<")) {
                setEmail(e.target.value);
              }
            }}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Mot de passe</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordTouched(true)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {!passwordTouched ? (
            <div className="password-rules">
              <p>Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un caractère spécial.</p>
            </div>
          ) : (
            <div className="password-strength">
              <div
                className={`strength-bar strength-${passwordStrength}`}
                style={{ width: `${(passwordStrength + 1) * 20}%` }}
              ></div>
            </div>
          )}
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={!username.trim() || !email || !password || passwordStrength > 7}
        >
          S'inscrire
        </button>
      </form>
      {openPopup && (
        <div className="popup">
          <p>Inscription réussie ! Vérifiez votre email pour confirmer votre compte.</p>
          <button onClick={closePopUp}>Fermer</button>
        </div>
      )}
    </div>
  );
};

export default RegisterCard;
