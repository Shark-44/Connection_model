### Rate Limiting dans Node.js
# 1. Définition

Le rate limiting est une technique permettant de limiter le nombre de requêtes qu’un client peut effectuer sur une API ou un serveur pendant une période donnée.
Objectifs principaux :

- Prévenir les abus et attaques de type DDoS.

- Protéger les ressources du serveur.

- Garantir une expérience utilisateur stable.

# 2. Pourquoi l’utiliser

- Pour les endpoints sensibles (login, création de compte, paiement).

- Pour éviter qu’un client ou un bot sur-sollicite le serveur.

- Pour contrôler l’accès à des APIs publiques ou internes.



Aujourd'hui il existe plusieurs technique d'implementation
    Dans la memoire de node, dans la bdd et Redis 

# 3. Cas d'utilisation avec BDD

1. Intégration a la bdd

```bash
ALTER TABLE users
ADD COLUMN failed_attempts INT DEFAULT 0,
ADD COLUMN last_failed_attempt DATETIME NULL;

```
2. Ajout dans le model user

```bash
failed_attempts: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
},
last_failed_attempt: {
  type: DataTypes.DATE,
  allowNull: true,
}

```
3. Modification du code

Dans mon modele, j'utilise un compteur < 3 et une remise a zero apres 15 min. Mais c'est un principe de scenario qui peut etre développé avec debloquage, par administrateur ou code de déverrouillage.

Cette logique de metier, je l'ai intégré dans auth.js. Mais peut être séparé dans un middleware.

```bash
export const rateLimitLogin = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const now = new Date();
    const { failed_attempts, last_failed_attempt } = user;
    const timeSinceLastAttempt = now - new Date(last_failed_attempt);

    if (failed_attempts >= 3 && timeSinceLastAttempt < 15 * 60 * 1000) {
      return res.status(403).json({
        message: "Trop de tentatives échouées. Veuillez réessayer plus tard."
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Erreur de rate limiting :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
```
