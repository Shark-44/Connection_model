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