import { useState } from "react";
import LoginCard from "../components/LoginCard";
import RegisterCard from "../components/RegisterCard";
import { login, logout } from "../api/userService";
import CookieConsent from "../components/CookieConsent";
import "./Home.css";

interface LoginCredentials {
  identifier: string;
  password: string;
  cookieConsent?: boolean | null;
  marketingConsent?: boolean | null;
}
function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);

  
  const handleLogin = async ({ identifier, password, cookieConsent, marketingConsent }: LoginCredentials) => {
    const response = await login(identifier, password, cookieConsent, marketingConsent);
    
    setUser(response.user);
  };

  


  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      console.log("🚪 Déconnexion réussie");
    } catch (error) {
      console.error("❌ Erreur de déconnexion :", error);
    }
  };

  const toggleCard = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="contenairHome">
      {user ? (
        // 👇 État connecté
        <div className="welcome-container">
          <h2>👋 Bienvenue, {user.username} !</h2>
          <button onClick={handleLogout} className="logoutButton">
            Se déconnecter
          </button>
        </div>
      ) : (
        // 👇 État non connecté : affichage des cartes login/register
        <>
          {showLogin ? (
            <LoginCard onLogin={handleLogin} />
          ) : (
            <RegisterCard />
          )}
          <button onClick={toggleCard} className="switchButton">
            {showLogin
              ? "Pas encore inscrit ? S'enregistrer"
              : "Déjà inscrit ? Se connecter"}
          </button>
        </>
      )}
    <CookieConsent />
    </div>
  );
}

export default Home;
