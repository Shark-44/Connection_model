import { useState } from "react";
import LoginCard from "../components/LoginCard";
import RegisterCard from "../components/RegisterCard";
import "./Home.css";

function Home() {
  const [showLogin, setShowLogin] = useState(true); // true = Login, false = Register

  const handleLogin = ({ email, password }: { email: string; password: string }) => {
    console.log("Tentative de connexion avec :", email, password);
    // Logique de connexion ici (ex : appel API)
  };

  const toggleCard = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="contenairHome">
      {showLogin ? (
        <LoginCard onLogin={handleLogin} />
      ) : (
        <RegisterCard />
      )}
      <button onClick={toggleCard} className="switchButton">
        {showLogin ? "Pas encore inscrit ? S'enregistrer" : "Déjà inscrit ? Se connecter"}
      </button>
    </div>
  );
}

export default Home;
