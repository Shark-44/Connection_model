import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import Token from "../models/Token.js";
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
  console.log("auth :",req)
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
  const jti = randomUUID();
  const payload = { sub: user.id, username: user.username, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    jwtid: jti,
    expiresIn: "1h",
    algorithm: "HS256",
  });
  return { token, jti };
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

// Vérification du token JWT dans les cookies + refresh automatique

export const checkToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.auth_token;

    if (!accessToken) throw { status: 401, message: "Token manquant" };

    // Récupérer IP et User-Agent du client
    const currentIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const currentDevice = req.headers['user-agent'];

    try {
      // Vérification du access token
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

      const tokenRecord = await Token.findOne({
        where: {
          jti: decoded.jti,
          revoked: false,
          expiresAt: { [Op.gt]: new Date() },
        },
      });

      if (!tokenRecord) throw { status: 401, message: "Token révoqué ou expiré" };

      // ---- Indicateurs de suspicion ----
      const ipChanged = tokenRecord.ip && tokenRecord.ip !== currentIP;
      const deviceChanged = tokenRecord.device && tokenRecord.device !== currentDevice;

      if (ipChanged && deviceChanged) {
        // Les deux ont changé → révoquer le token
        await tokenRecord.update({ revoked: true });
        console.log(`[Sécurité] Token révoqué car device et IP différents : ${currentDevice} / ${currentIP}`);
        throw { status: 401, message: "Token révoqué pour suspicion" };
      } else if (ipChanged || deviceChanged) {
        // Simple suspicion → log mais pas de révocation
        console.log(`[Suspicion] Changement détecté mais token non révoqué : deviceChanged=${deviceChanged}, ipChanged=${ipChanged}`);
      }

      // Tout est ok → passer à la suite
      req.user = decoded;
      return next();

    } catch (err) {
      // Si token expiré → tenter refresh
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) throw { status: 401, message: "Refresh token manquant" };

        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const refreshRecord = await Token.findOne({
          where: {
            jti: decodedRefresh.jti,
            revoked: false,
            expiresAt: { [Op.gt]: new Date() },
          },
        });

        if (!refreshRecord) throw { status: 401, message: "Refresh token invalide ou expiré" };

        const user = await User.findByPk(decodedRefresh.sub);
        if (!user) throw { status: 404, message: "Utilisateur introuvable" };

        // Générer un nouveau access token
        const { token: newAccessToken, jti: newJti } = generateToken(user);

        // Optionnel : renouveler le refresh token
        const { token: newRefreshToken, jti: newRefreshJti } = generateToken(user, "7d");

        // Révoquer l’ancien refresh token et stocker le nouveau
        await refreshRecord.update({ revoked: true });
        await Token.create({
          userId: user.id,
          jti: newRefreshJti,
          hashToken: newRefreshToken,
          revoked: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ip: currentIP,
          device: currentDevice
        });

        // Envoyer les nouveaux cookies
        res.cookie("auth_token", newAccessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        res.cookie("refresh_token", newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        req.user = { id: user.id, username: user.username, email: user.email };
        return next();
      }

      // Si autre erreur → 401
      throw { status: 401, message: "Token invalide" };
    }
  } catch (err) {
    next(err);
  }
};