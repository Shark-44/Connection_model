### Les cookies rappel

Les cookies permettent d'identifier un utilisateur dans les requetes.


Règles essentielles

- httpOnly: true
Le cookie n’est jamais accessible en JavaScript. Indispensable pour la sécurité.

- secure

true en production (HTTPS obligatoire).

false en développement local.

- sameSite

lax par défaut (bon compromis).

Mettre none si frontend et backend sont sur des domaines différents, mais alors secure: true devient obligatoire.

- maxAge
Durée de vie en millisecondes.

###  Les cookies et le RGPD

- Cookies strictement nécessaires (exemptés de consentement)

Exemples :

Cookies de session (panier, authentification).
Cookies de sécurité (CSRF, load balancing).


Règle :

Pas besoin de consentement (mais il faut les mentionner dans la politique de confidentialité).
Ne peuvent pas être désactivés (sinon le site ne fonctionne pas).



- Cookies nécessitant un consentement

Exemples :

Cookies de tracking (Google Analytics, publicités ciblées).
Cookies de préférences non essentielles (langue, thème).


Règle :

Consentement explicite (bouton "Accepter" ou "Refuser").
Possibilité de refuser sans bloquer l’accès au site (sauf si le cookie est technique).

### Flow du consentement

J'ai concentré l'enregistrement du consentement lors d'un login ou un createuser.
Une nouvelle table a été créée, user_consent 
Ainsi j'associe a un user, mais je verifie s'il a modifié son accord.

Le prochain objectif est de modifier et le droit a l'oubli.