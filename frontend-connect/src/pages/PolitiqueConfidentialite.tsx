import "./Politique.css"
import { Link } from "react-router-dom"; // Si tu utilises React Router

const PolitiqueConfidentialite = () => {
  return (
    <div className="privacy-policy">
      <h1>Politique de Confidentialité</h1>
      <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString()}</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Nous nous engageons à protéger votre vie privée. Cette politique explique comment nous traitons vos données personnelles et utilisons les cookies sur ce site.
        </p>
      </section>

      <section>
        <h2>2. Données personnelles collectées</h2>
        <p>
          Nous collectons uniquement les données nécessaires à la fourniture de nos services :
        </p>
        <ul>
          <li><strong>Données d’inscription</strong> : email, nom d’utilisateur, mot de passe (chiffré).</li>
          <li><strong>Données de connexion</strong> : adresse IP, heure de connexion (pour la sécurité).</li>
        </ul>
        <p>
          Ces données sont utilisées uniquement pour vous authentifier et sécuriser votre compte.
        </p>
      </section>

      <section>
        <h2>3. Cookies</h2>
        <h3>Cookies nécessaires</h3>
        <p>
          Ces cookies sont indispensables au fonctionnement du site et <strong>ne nécessitent pas votre consentement</strong> :
        </p>
        <ul>
          <li><strong>Cookies de session</strong> : pour maintenir votre connexion.</li>
          <li><strong>Cookies de sécurité</strong> : pour protéger votre compte (ex : CSRF).</li>
          <li><strong>Cookies de panier</strong> : pour mémoriser vos articles (si e-commerce).</li>
        </ul>
        <p>
          <em>Nous n’utilisons pas de cookies de tracking ou publicitaires.</em>
        </p>
      </section>

      <section>
        <h2>4. Vos droits</h2>
        <p>
          Conformément au RGPD, vous avez le droit de :
        </p>
        <ul>
          <li>Accéder à vos données.</li>
          <li>Les rectifier ou les supprimer.</li>
          <li>Vous opposer à leur traitement.</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@example.com">contact@example.com</a>.
        </p>
      </section>

      <section>
        <h2>5. Sécurité</h2>
        <p>
          Vos données sont protégées par des mesures techniques (chiffrement, pare-feu) et organisationnelles (accès restreint).
        </p>
      </section>

      <section>
        <h2>6. Modifications</h2>
        <p>
          Cette politique peut être mise à jour. Nous vous invitons à la consulter régulièrement.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Pour toute question : <a href="mailto:contact@example.com">contact@example.com</a>.
        </p>
      </section>

      <div className="back-link">
        <Link to="/">Retour à l’accueil</Link>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
