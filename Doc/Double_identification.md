# Double authentification (2FA) — Introduction et démarche

## Objectif du module de connexion

Ce projet a pour objectif de proposer un modèle de connexion sécurisé et réutilisable.
Il s’agit d’un exemple concret de bonnes pratiques d’authentification, combinant simplicité, pédagogie et sécurité.

La connexion est la porte d’entrée principale d’une application.
Elle représente donc un point critique pour la sécurité : mot de passe faible, réutilisé ou volé peuvent compromettre les données utilisateurs.

Pour y remédier, ce modèle intègre :

- le hashage des mots de passe via Argon2id,

- un rate limiting pour bloquer les tentatives abusives,

- une double authentification (2FA) par code email.

## Pourquoi ajouter une double authentification

La double authentification (2FA) ajoute une seconde étape après la saisie du mot de passe.
Elle permet de vérifier que la personne qui tente de se connecter est bien le véritable utilisateur, même si ses identifiants ont été compromis.

Les bénéfices principaux :

🔒 Renforcer la sécurité des comptes

🚫 Réduire les risques d’accès non autorisés

🧠 Montrer une démarche de développement responsable

⚖️ S’inscrire dans le cadre du RGPD et de la protection des données

## Démarche de conception

Ce projet ne vise pas à tout implémenter, mais à montrer une conscience claire des menaces et des solutions.
L’objectif est double :

1. Mettre en œuvre une protection réaliste et fonctionnelle.

2. Documenter la démarche pour servir de base à d’autres projets.

La sécurité doit être vue comme un processus d’amélioration continue.
Ce modèle est donc conçu pour être simple, compréhensible et évolutif — une première marche vers des standards plus avancés (TOTP, FIDO2, etc.).

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

1. L’utilisateur se connecte avec ses identifiants.

2. Un code unique et temporaire est généré puis envoyé par mail.

3. L’utilisateur valide ce code pour confirmer sa connexion.

## En résumé

Cette approche démontre :

* Une prise de conscience des risques liés à l’authentification.

* Une application concrète d’une mesure de sécurité additionnelle.

* Une volonté d’évolution vers des standards plus robustes.

Ce module se veut avant tout une base de référence, que je fais évoluer au fil de mon apprentissage.
Il illustre ma progression vers des pratiques de développement web plus sûres et professionnelles.