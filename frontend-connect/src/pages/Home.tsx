import { useState, useEffect } from "react";
import LoginCard from "../components/LoginCard";
import RegisterCard from "../components/RegisterCard";
import { login, logout, updateConsent } from "../api/userService"; 
import CookieConsent from "../components/CookieConsent";
import { LoginCredentials } from "../types/types";
import "./Home.css";
import UserPreferences from "../components/UserPreferences";



function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null); // 👈 Ajout de l'id
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [marketingConsent, setMarketingConsent] = useState<boolean | null>(null);

  // 👇 Charger les préférences depuis localStorage au montage
  useEffect(() => {
    const cookieConsentLS = localStorage.getItem("cookieConsent");
    const marketingConsentLS = localStorage.getItem("marketingConsent");
    
    setCookieConsent(cookieConsentLS !== null ? cookieConsentLS === "true" : null);
    setMarketingConsent(marketingConsentLS !== null ? marketingConsentLS === "true" : null);
  }, []);

  const handleLogin = async ({ identifier, password, cookieConsent, marketingConsent }: LoginCredentials) => {
    const response = await login(identifier, password, cookieConsent, marketingConsent);
    
    setUser(response.user);
    
    // 👇 Mettre à jour les états locaux avec les préférences de l'utilisateur
    setCookieConsent(response.user.cookieConsent ?? null);
    setMarketingConsent(response.user.marketingConsent ?? null);
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

  // 👇 Fonction pour mettre à jour les consentements
  const handleUpdateConsent = async (cookie: boolean | null, marketing: boolean | null) => {
    if (!user) return;
   
    await updateConsent(
      user.id,
      cookie ?? false,
      marketing ?? false
    );

    // Mise à jour du localStorage
    if (cookie !== null) {
      localStorage.setItem("cookieConsent", cookie.toString());
    } else {
      localStorage.removeItem("cookieConsent");
    }

    if (marketing !== null) {
      localStorage.setItem("marketingConsent", marketing.toString());
    } else {
      localStorage.removeItem("marketingConsent");
    }

    // Mise à jour des états locaux
    setCookieConsent(cookie);
    setMarketingConsent(marketing);
  };

  const toggleCard = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="contenairHome">
      {user ? (
        <div className="welcome-container">
          <h2>👋 Bienvenue, {user.username} !</h2>
          <UserPreferences
            userId={user.id}
            initialCookieConsent={cookieConsent}
            initialMarketingConsent={marketingConsent}
            onUpdateConsent={handleUpdateConsent}
          />
          <button onClick={handleLogout} className="logoutButton">
            Se déconnecter
          </button>
        </div>
      ) : (
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