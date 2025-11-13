#JTI

c'est une notion que je decouvre, ainsi j'ai cree une table token dont le modele est dans mon back.

## À quoi sert le JTI ?

Le JTI est principalement utilisé pour :

1.  Prévenir la réutilisation de tokens - En enregistrant les JTI utilisés, on peut détecter les tokens rejouées (replay attacks)
2. Révocation de tokens - Permet de maintenir une liste noire (blacklist) des tokens révoqués avant leur expiration naturelle
3. Audit et traçabilité - Associer chaque token à un utilisateur et suivre son utilisation

Ainsi c'est une etape supplementaire sur les cookies, le consentement RGPD.