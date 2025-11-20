import { useState, type FormEvent } from "react";
import { useRegister } from "../hooks/useRegister";
import { useFormValidation } from "../hooks/useFormValidation";
import { registerSchema } from "../schemas/authSchemas";
import zxcvbn from "zxcvbn";
import "./AuthCard.css";

const RegisterCard = () => {
  // États du formulaire
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

  // Hooks personnalisés
  const { isLoading, error, isSuccess, register, resetState } = useRegister();
  const { fieldErrors, validateField, clearFieldError } = useFormValidation(registerSchema);

  /**
   * Gestion du changement du nom d'utilisateur
   */
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart();
    if (!/[<>]/.test(value)) {
      setUsername(value);
      clearFieldError("username");
    }
  };

  /**
   * Validation du nom d'utilisateur au blur
   */
  const handleUsernameBlur = () => {
    if (username) {
      validateField("username", username);
    }
  };

  /**
   * Gestion du changement de l'email
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/[<>]/.test(value)) {
      setEmail(value);
      clearFieldError("email");
    }
  };

  /**
   * Validation de l'email au blur
   */
  const handleEmailBlur = () => {
    if (email) {
      validateField("email", email);
    }
  };

  /**
   * Gestion du changement du mot de passe
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/[<>]/.test(value)) {
      setPassword(value);
      clearFieldError("password");
      
      if (!passwordTouched && value.length > 0) {
        setPasswordTouched(true);
      }
      
      // Calcul de la force du mot de passe
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
    }
  };

  /**
   * Validation du mot de passe au blur
   */
  const handlePasswordBlur = () => {
    if (password) {
      validateField("password", password);
    }
  };

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await register({
      username,
      email,
      password,
    });
  };

  /**
   * Fermeture de la popup de succès
   */
  const closePopUp = () => {
    resetState();
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordStrength(0);
    setPasswordTouched(false);
  };

  return (
    <div className="auth-card">
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        {/* Nom d'utilisateur */}
        <div className="input-group">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            disabled={isLoading}
            required
          />
          {fieldErrors.username && (
            <div className="field-error">{fieldErrors.username}</div>
          )}
        </div>

        {/* Email */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            disabled={isLoading}
            required
          />
          {fieldErrors.email && (
            <div className="field-error">{fieldErrors.email}</div>
          )}
        </div>

        {/* Mot de passe */}
        <div className="input-group">
          <label htmlFor="password">Mot de passe</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              onFocus={() => setPasswordTouched(true)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          {/* Règles du mot de passe ou barre de force */}
          {!passwordTouched ? (
            <div className="password-rules">
              <p>
                Le mot de passe doit contenir au moins 8 caractères, une
                majuscule, une minuscule et un caractère spécial.
              </p>
            </div>
          ) : (
            <div className="password-strength">
              <div
                className={`strength-bar strength-${passwordStrength}`}
                style={{ width: `${(passwordStrength + 1) * 20}%` }}
              ></div>
            </div>
          )}
          
          {fieldErrors.password && (
            <div className="field-error">{fieldErrors.password}</div>
          )}
        </div>

        {/* Message d'erreur global */}
        {error && <div className="error-message">{error}</div>}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={
            isLoading ||
            !username.trim() ||
            !email ||
            !password ||
            passwordStrength > 7
          }
        >
          {isLoading ? "Inscription en cours..." : "S'inscrire"}
        </button>
      </form>

      {/* Popup de succès */}
      {isSuccess && (
        <div className="popup">
          <p>
            Inscription réussie ! Vérifiez votre email pour confirmer votre
            compte.
          </p>
          <button onClick={closePopUp}>Fermer</button>
        </div>
      )}
    </div>
  );
};

export default RegisterCard;