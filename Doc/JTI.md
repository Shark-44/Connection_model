#JTI

c'est une notion que je decouvre, ainsi j'ai cree une table token dont le modele est dans mon back.

## À quoi sert le JTI ?

Le JTI est principalement utilisé pour :

1.  Prévenir la réutilisation de tokens - En enregistrant les JTI utilisés, on peut détecter les tokens rejouées (replay attacks)
2. Révocation de tokens - Permet de maintenir une liste noire (blacklist) des tokens révoqués avant leur expiration naturelle
3. Audit et traçabilité - Associer chaque token à un utilisateur et suivre son utilisation

Ainsi c'est une etape supplementaire sur les cookies, le consentement RGPD.

### Cas du refresh.

Le cookie est limité a 1h ce qui est enregistré dans la table token. Mais dans une experience forum par exemple, l'utilisateur peut passer du temps. Donc integrer un refresh automatique. Le front capte une erreur 401 qui est token manquant et avec un booelen retry? permet d'appeler la fonction refresh token.
Ainsi le back passe a une expiration de 7j et memorise dans la bdd. Le checktoken est alors toujours valide.

### La purge

L'interet est double. Une des deux raisons est de ne pas encombrer la bdd et la deuxieme raison qui prend un sens est le respect du RGPD. Ainsi node-cron permet une execusion de purge. Certes dans un schema simple, cela peut devenir assez complexe lors d'operations de maintenance sur un site web.

### La revocation des tokens avec suspicion

L'etude m'a montré des aspects techniques assez vaste. Ainsi je comprends que l'on peut demander a des services exterieurs de gerer les differents cas. Oui comment répondre a la sécurité web qui évolue regulierement. Aujourd'hui, j'ai abordé un regard leger a titre d'exemple. L'usurpation d'un token, peut mettre a mal des données. Ainsi dans un cas je regarde les headers avec l'IP et le type de device qui seraient different apres la connexion d'un user et j'ai implementé la revoaction du token. En allant plus loin j'ai trouvé www.akamai.com qui propose une reelle protection contre les differentes attaques.