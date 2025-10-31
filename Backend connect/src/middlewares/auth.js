import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { Op } from "sequelize";

// ⚙️ Configuration Argon2id
const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

// 🧂 Middleware pour hasher le mot de passe avant création
export const hashPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Mot de passe requis" });
    }
    const hashedPassword = await argon2.hash(password, hashingOptions);
    req.body.hashedPassword = hashedPassword;
    delete req.body.password; // Supprime la version brute du mot de passe
    next();
  } catch (err) {
    console.error("Erreur de hachage :", err);
    res.status(500).json({ message: "Erreur serveur pendant le hachage" });
  }
};

// Middleware pour vérifier le mot de passe (utilisable lors du login)
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
