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
export const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = req.user; // req.user devrait être défini avant (ex: par une requête SQL)

    if (!user || !user.password) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Génération du token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("auth_token", token, { httpOnly: true, secure: false });
    res.status(200).json({ message: "Connexion réussie ✅", user });

  } catch (err) {
    console.error("Erreur de vérification :", err);
    res.status(500).json({ message: "Erreur serveur pendant la vérification" });
  }
};
