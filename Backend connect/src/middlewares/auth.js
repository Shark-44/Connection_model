import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { Op } from "sequelize";

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

// Hasher le mot de passe avant création
export const hashPassword = async (req, res, next) => {
  try {
    
    const { password } = req.body;
    if (!password) throw { status: 400, message: "Mot de passe requis" };

    req.body.hashedPassword = await argon2.hash(password, hashingOptions);
    delete req.body.password;
    
    next();
  } catch (err) {
    next(err);
  }
};

// Génération JWT
export const generateToken = (user) => {
  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Vérification du mot de passe
export const verifyPassword = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) throw { status: 400, message: "Identifiant et mot de passe requis" };

    const user = await User.findOne({
      where: { [Op.or]: [{ email: identifier }, { username: identifier }] },
    });

    if (!user) throw { status: 404, message: "Utilisateur introuvable" };
    if (!user.is_verified) throw { status: 403, message: "Compte non vérifié", needVerification: true, email: user.email };

    const now = new Date();

    // Reset tentatives échouées après 15 min
    if (user.failed_attempts > 0 && now - new Date(user.last_failed_attempt) >= 15 * 60 * 1000) {
      await user.update({ failed_attempts: 0, last_failed_attempt: null });
      user.failed_attempts = 0;
      user.last_failed_attempt = null;
    }

    if (user.failed_attempts >= 3) throw { status: 403, message: "Trop de tentatives échouées. Réessayez plus tard." };

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      await user.update({ failed_attempts: user.failed_attempts + 1, last_failed_attempt: now });
      throw { status: 401, message: "Mot de passe incorrect" };
    }

    // Reset tentatives échouées si OK
    if (user.failed_attempts > 0) await user.update({ failed_attempts: 0, last_failed_attempt: null });

    req.user = user;
    req.token = generateToken(user);

    next();
  } catch (err) {
    next(err);
  }
};

// Vérification du token JWT dans les cookies
export const checkToken = (req, res, next) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) throw { status: 401, message: "Token manquant" };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    next({ status: 401, message: "Token invalide ou expiré" });
  }
};