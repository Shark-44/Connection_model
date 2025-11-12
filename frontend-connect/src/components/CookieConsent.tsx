import { useState, useEffect } from "react";
import "./CookieConsent.css";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState<boolean>(true);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent !== null) {
      setShowBanner(false);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("cookieConsent", accepted.toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent">
      <p>
        Nous utilisons des cookies <strong>nécessaires au fonctionnement du site</strong> (connexion, panier).
        <br />
        <a
          href="/politique-confidentialite"
          target="_blank"
          rel="noopener noreferrer"
        >
          En savoir plus sur notre utilisation des cookies
        </a>
        {" | "}
        <a
          href="https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi"
          target="_blank"
          rel="noopener noreferrer"
        >
          Loi et RGPD (CNIL)
        </a>
      </p>
      <div className="cookie-buttons">
        <button onClick={() => handleConsent(true)}>Accepter</button>
        <button onClick={() => handleConsent(false)}>Refuser les cookies optionnels</button>
      </div>
    </div>
  );
};

export default CookieConsent;
