import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Token from "../models/Token.js";
import User from "../models/user.model.js";
import { generateToken } from "../middlewares/auth.js";

export const refreshToken = async (req, res, next) => {
  /*console.log("refresh token")
  console.log("controle des cookies",req.cookies)
  console.log("controle du body",req.body) Pour des tests */
  try {
    const accessToken = req.cookies?.auth_token;
    if (!accessToken) throw { status: 499, message: "probleme !" };

    // Vérifier le token existant (même s’il est expiré, pour retrouver le jti)
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name !== "TokenExpiredError") throw { status: 401, message: "Token invalide" };
      decoded = jwt.decode(accessToken); // récupère les infos même si expiré
    }

    // Chercher le token dans la table
    const tokenRecord = await Token.findOne({
      where: { jti: decoded.jti, revoked: false },
    });
    if (!tokenRecord) throw { status: 401, message: "Token introuvable ou révoqué" };

    const user = await User.findByPk(decoded.sub);
    if (!user) throw { status: 404, message: "Utilisateur introuvable" };

    // --- Générer un nouveau token valide 7 jours ---
    const { token: newAccessToken, jti: newJti } = generateToken(user, "7d");
   // console.log("tokenRecord avant update", tokenRecord.toJSON());
    // --- Mettre à jour la table Token ---
    await tokenRecord.update({
      jti: newJti,
      hashToken: newAccessToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // --- Envoyer le nouveau cookie ---
    res.cookie("auth_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({ message: "Token rafraîchi avec succès" });
  } catch (err) {
    next(err);
  }
};
