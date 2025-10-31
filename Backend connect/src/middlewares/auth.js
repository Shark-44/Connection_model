import argon2 from "argon2";
import jwt from "jsonwebtoken";

// Configuration sécurisée pour Argon2id
const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // mémoire utilisée
  timeCost: 5,         // temps de calcul (plus haut = plus sûr, mais plus lent)
  parallelism: 1,      // threads utilisés
};

// Middleware pour hasher le mot de passe
export const hashPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Mot de passe requis" });
    }

    const hashedPassword = await argon2.hash(password, hashingOptions);
    req.body.hashedPassword = hashedPassword;
    delete req.body.password; // on supprime le mot de passe brut pour éviter tout risque

    next();
  } catch (err) {
    console.error("Erreur de hachage :", err);
    res.status(500).json({ message: "Erreur serveur pendant le hachage" });
  }
};

// Middleware pour vérifier le mot de passe (utilisable lors du login)
// Ajout de rate timiling
export const verifyPassword = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifiant et mot de passe requis" });
    }

    // Recherche par email OU username
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

    // Vérification du rate limiting
    const now = new Date();
    const { failed_attempts, last_failed_attempt } = user;
    const timeSinceLastAttempt = now - new Date(last_failed_attempt);

    if (failed_attempts >= 3 && timeSinceLastAttempt < 15 * 60 * 1000) {
      return res.status(403).json({
        message: "Trop de tentatives échouées. Veuillez réessayer plus tard."
      });
    }

    // Vérification du mot de passe
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      // Incrémente le compteur de tentatives échouées
      await User.update(
        {
          failed_attempts: failed_attempts + 1,
          last_failed_attempt: now,
        },
        { where: { id: user.id } }
      );
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Réinitialise le compteur si la connexion réussit
    if (failed_attempts > 0) {
      await User.update(
        {
          failed_attempts: 0,
          last_failed_attempt: null,
        },
        { where: { id: user.id } }
      );
    }

    // Génération du token
    const token = generateToken(user);
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error("Erreur de vérification :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
