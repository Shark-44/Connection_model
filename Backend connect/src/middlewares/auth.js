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

// 🔑 Génération du token JWT (fonction utilitaire)
const generateToken = (user) => {
  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email,
  };
  console.log("Génération du token pour l'utilisateur :", user.username);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 🔐 Middleware de vérification du mot de passe et génération du token
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

    // Attache l'utilisateur et le token à la requête
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.error("Erreur de vérification :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🛡️ Middleware de vérification du token dans les cookies
export const checkToken = (req, res, next) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Injecte l'utilisateur dans la requête
    next();
  } catch (err) {
    console.error("Token invalide :", err);
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};