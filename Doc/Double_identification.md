# Double authentification (2FA) — Introduction et démarche

## Objectif du module de création de compte sécurisé

Ce projet propose un modèle de création de compte sécurisé et réutilisable, illustrant les bonnes pratiques d’authentification avec simplicité et pédagogie.

La création d’un compte est un moment critique : des informations invalides, des mots de passe faibles ou un email compromis peuvent nuire à la sécurité. Pour y remédier, ce modèle intègre :

- le hashage des mots de passe via Argon2id,

- un rate limiting pour bloquer les tentatives abusives,

- une validation par code temporaire (OTP) envoyé par email, pour garantir que l’adresse email est bien détenue par l’utilisateur.

## Pourquoi ajouter une validation par code (OTP) à la création de compte

La validation par code envoyé à l’email ajoute une étape de vérification : elle confirme que l’utilisateur est bien propriétaire de l’adresse email fournie, même si le mot de passe est compromis ou mal choisi.

Bénéfices principaux :

🔒 Sécuriser la création du compte
🚫 Éviter les comptes invalides ou frauduleux
🧠 Montrer une démarche de développement responsable
⚖️ Respecter les bonnes pratiques de protection des données (RGPD)

## Démarche de conception

Ce projet vise à montrer une approche simple mais réaliste de la sécurité, avec deux objectifs :

Mettre en œuvre une protection fonctionnelle lors de la création de compte.

Documenter la démarche pour servir de référence dans d’autres projets.

La sécurité est un processus continu. Ce modèle est donc conçu pour être simple, compréhensible et évolutif — une première marche vers des standards plus avancés (TOTP, FIDO2…).

## Les principales méthodes de 2FA

| Méthode | Description | Avantages | Limites |
|----------|--------------|------------|----------|
| **Code par email** | Envoi d’un code temporaire à usage unique | Simple, gratuit, intégré à un mailer existant | Dépend du service mail |
| **Application TOTP** | Code généré via une app (Google Authenticator, Authy) | Très sécurisée, fonctionne hors ligne | Nécessite une app et la gestion d’une clé secrète |
| **Code par SMS** | Code envoyé par message texte | Habitude utilisateur, rapide à comprendre | Coût, dépendance à un fournisseur tiers |


## Choix retenu : le code envoyé par email

J’ai choisi la méthode par code email, car elle :

* s’intègre facilement à mon service mailer (Ethereal),

* ne requiert aucun service payant,

* reste idéale pour un projet de démonstration pédagogique.

### Fonctionnement :

L’utilisateur saisit email et mot de passe (et éventuellement username) sur le formulaire de création de compte.

Le backend crée un utilisateur en attente de validation.

Un code OTP temporaire est généré et envoyé par email.

L’utilisateur saisit ce code dans le formulaire de validation.

Le backend vérifie le code OTP :

Si valide → le compte est activé (et éventuellement un JWT est émis).

Si invalide → le compte reste inactif ou est supprimé.

### En résumé

Page création compte
        │
        ▼
Email + Mot de passe (+ username)
        │
        ▼
Backend : créer utilisateur en “attente de validation”
        │
        ▼
Génération OTP
        │
        ▼
Envoi OTP par mail
        │
        ▼
Utilisateur saisit code OTP
        │
        ▼
Backend : validation OTP
        │
        ▼
Si valide → compte activé / JWT (optionnel)
Si invalide → compte inactif ou suppression

Cette premiere étape realisée je m'interroge sur des sujets:

- La purge faite automatiquement dans sql avec un EVENT:
```bash
CREATE EVENT purge_unverified_users
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP
DO
  DELETE FROM users
  WHERE is_verified = 0
    AND created_at < NOW() - INTERVAL 3 DAY;
```
- Script Node.js (cron / scheduler) pour purger...

Je n'ai pas bloque encore un compte non verifié, etudié la durée de validité d'un OTP. Encore beaucoup de question a la sécurité.

A- J'ai opté pour un renvoi du code expiré max 5 fois et un code qui peut etre renvoye apres 1 min pour eviter des multiples requetes.

B- j'ai renforcé le login en ajoutant user is_verify 

C- Suites a des essais, la gestion des erreurs devient compliquée donc utilisation d'une logique de metier pour les erreurs.
```bash
| Contexte / Contrôleur                               | Condition d'erreur                                | Code HTTP | Message envoyé                                                                                           |
| --------------------------------------------------- | ------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| **Inscription (`createuser`)**                      | Champs requis manquants                           | 400       | "Champs requis manquants"                                                                                |
|                                                     | Email déjà utilisé                                | 409       | "Email déjà utilisé"                                                                                     |
|                                                     | Erreur serveur                                    | 500       | "Erreur serveur"                                                                                         |
| **Connexion (`verifyPassword`)**                    | Identifiant ou mot de passe manquant              | 400       | "Identifiant et mot de passe requis"                                                                     |
|                                                     | Utilisateur introuvable                           | 404       | "Utilisateur introuvable"                                                                                |
|                                                     | Compte non vérifié                                | 403       | "Votre compte n'est pas encore vérifié. Veuillez entrer votre code OTP." (avec `needVerification: true`) |
|                                                     | Trop de tentatives échouées                       | 403       | "Trop de tentatives échouées. Veuillez réessayer plus tard."                                             |
|                                                     | Mot de passe incorrect                            | 401       | "Mot de passe incorrect"                                                                                 |
|                                                     | Erreur serveur                                    | 500       | "Erreur serveur"                                                                                         |
| **Vérification compte (`verifyAccount`)**           | Email ou code manquant                            | 400       | "Email et code requis"                                                                                   |
|                                                     | Utilisateur introuvable                           | 426       | "Utilisateur introuvable"                                                                                |
|                                                     | Compte déjà vérifié                               | 427       | "Compte déjà vérifié"                                                                                    |
|                                                     | Code OTP invalide                                 | 428       | "Code invalide"                                                                                          |
|                                                     | Code OTP expiré                                   | 429       | "Code expiré"                                                                                            |
|                                                     | Validation OK                                     | 200       | "Compte vérifié avec succès"                                                                             |
|                                                     | Erreur serveur                                    | 500       | "Erreur serveur"                                                                                         |
| **Resend OTP (`resendOtp`)**                        | Email manquant                                    | 400       | "Email requis"                                                                                           |
|                                                     | Utilisateur introuvable                           | 404       | "Utilisateur introuvable"                                                                                |
|                                                     | Compte déjà vérifié                               | 400       | "Compte déjà vérifié"                                                                                    |
|                                                     | Cooldown non écoulé                               | 429       | "Attendez avant de redemander un code"                                                                   |
|                                                     | Limite resend atteinte                            | 429       | "Limite atteinte"                                                                                        |
|                                                     | Envoi mail OK                                     | 200       | "Nouveau code OTP envoyé"                                                                                |
|                                                     | Erreur serveur                                    | 500       | "Erreur serveur"                                                                                         |
| **Mot de passe oublié (`forgotPassword`)**          | Email manquant                                    | 400       | "Email requis"                                                                                           |
|                                                     | Si utilisateur introuvable → pas d’erreur révélée | 200       | "Si un compte existe, un mail a été envoyé."                                                             |
|                                                     | Envoi mail OK                                     | 200       | "Email de réinitialisation envoyé."                                                                      |
|                                                     | Erreur serveur                                    | 500       | "Erreur serveur"                                                                                         |
| **Réinitialisation mot de passe (`resetPassword`)** | Token ou mot de passe manquant                    | 400       | "Token et mot de passe requis"                                                                           |
|                                                     | Utilisateur introuvable                           | 404       | "Utilisateur introuvable"                                                                                |
|                                                     | Token invalide ou expiré                          | 400       | "Token invalide ou expiré"                                                                               |
|                                                     | Mot de passe réinitialisé                         | 200       | "Mot de passe réinitialisé avec succès"                                                                  |
|                                                     | Erreur serveur                                    | 500       | "Erreur serveur"                                                                                         |
| **Middleware `checkToken`**                         | Token manquant                                    | 401       | "Token manquant"                                                                                         |
|                                                     | Token invalide ou expiré                          | 401       | "Token invalide ou expiré"                                                                               |
```