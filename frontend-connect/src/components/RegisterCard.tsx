import { useState, type FormEvent } from "react";
import { createUser } from "../api/userService";
import { APIError } from '../api/apiWrapper';
//import PopUp from '../components/specificPageComponents/PopUp';
//  <PopUp openPopUp={openPopup} closePopUp={closePopUp} />
import "./AuthCard.css";

const RegisterCard = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [openPopup, setOpenPopup] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
       await createUser(username,email, password);
      
      setOpenPopup(true);
      
    } catch (err) {
      if (err instanceof APIError){
      setError(err.message);
      setOpenPopup(false);
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
          <label htmlFor="Username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => {
            const value = e.target.value.trimStart(); // empêche les espaces au début
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
          <input
            id="password"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => {
              if (!e.target.value.includes(">") && !e.target.value.includes("<")) {
                setPassword(e.target.value);
              }
            }}
            required
          />
        </div>
        {error && (
          <div key={error} className="error-message">
            {error}
          </div>
        )}
        <button type="submit">S'inscrire</button>
      </form>
    
    </div>
  );
};

export default RegisterCard;
