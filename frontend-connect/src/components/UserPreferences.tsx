// src/components/UserPreferences.tsx
import { useState, useEffect } from "react";
import "./UserPreferences.css";

interface UserPreferencesProps {
  userId: number;
  initialCookieConsent: boolean | null;
  initialMarketingConsent: boolean | null;
  onUpdateConsent: (cookie: boolean | null, marketing: boolean | null) => Promise<void>;
}

export default function UserPreferences({
  
  initialCookieConsent,
  initialMarketingConsent,
  onUpdateConsent,
}: UserPreferencesProps) {
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(initialCookieConsent);
  const [marketingConsent, setMarketingConsent] = useState<boolean | null>(initialMarketingConsent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await onUpdateConsent(cookieConsent, marketingConsent);
      setMessage("Préférences enregistrées.");
    } catch (err) {
      setMessage("Erreur lors de la sauvegarde.");
    }

    setSaving(false);
  };
  useEffect(() => {
    setCookieConsent(initialCookieConsent);
    setMarketingConsent(initialMarketingConsent);
  }, [initialCookieConsent, initialMarketingConsent]);

  return (
    <div className="preferences-container">
      <h3>Gestion de vos préférences</h3>

      <div className="preference-item">
        <div>
          <strong>Cookies essentiels</strong>
          <p>
            Indispensables pour se connecter, sécuriser votre compte et utiliser les fonctionnalités.
            Site lisible sans, mais les services seront désactivés.
          </p>
        </div>

        {/* Toggle switch essentiel */}
        <label className="switch">
          <input
            type="checkbox"
            checked={!!cookieConsent}
            onChange={(e) => setCookieConsent(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="preference-item">
        <div>
          <strong>Cookies marketing</strong>
          <p>Améliorent l’expérience et permettent des recommandations adaptées.</p>
        </div>

        {/* Toggle switch marketing */}
        <label className="switch">
          <input
            type="checkbox"
            checked={!!marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <button className="save-button" onClick={handleSave} disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer mes préférences"}
      </button>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}