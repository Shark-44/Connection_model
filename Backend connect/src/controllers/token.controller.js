import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Token from "../models/Token.js";
import User from "../models/user.model.js";
import { generateToken } from "../middlewares/auth.js";

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw { status: 401, message: "Refresh token manquant" };

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const tokenRecord = await Token.findOne({
      where: { jti: decoded.jti, revoked: false, expiresAt: { [Op.gt]: new Date() } }
    });

    if (!tokenRecord) throw { status: 401, message: "Refresh token invalide ou expiré" };

    const user = await User.findByPk(decoded.sub);

    // Générer un nouveau access token
    const { token: newAccessToken, jti: newJti } = generateToken(user, "1h");

    // Générer un nouveau refresh token et révoquer l'ancien
    const { token: newRefreshToken, jti: newRefreshJti } = generateToken(user, "7d");
    await tokenRecord.update({ revoked: true });
    await Token.create({
      userId: user.id,
      jti: newRefreshJti,
      hashToken: newRefreshToken,
      revoked: false,
      expiresAt: new Date(Date.now() + 7*24*60*60*1000)
    });

    res.cookie("auth_token", newAccessToken, { httpOnly: true, maxAge: 60*60*1000 });
    res.cookie("refresh_token", newRefreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000 });

    res.json({ message: "Nouveau token généré" });
  } catch (err) {
    next(err);
  }
};
