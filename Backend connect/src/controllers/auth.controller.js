import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { sendResetEmail } from "../services/mailer.service.js";

const RESET_SECRET = process.env.RESET_SECRET || "secret_reset_token";

// ✅ Demander une réinitialisation du mot de passe
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw { status: 400, message: "Email requis" };

    const user = await User.findOne({ where: { email } });

    // ✅ Toujours renvoyer une réponse vague → empêche la découverte d'emails
    if (!user) return res.status(200).json({ message: "Si un compte existe, un mail a été envoyé." });

    // ✅ Générer un token JWT (15 minutes)
    const token = jwt.sign(
      { id: user.id },
      RESET_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Envoi email
    await sendResetEmail(user.email, token);

    res.status(200).json({ message: "Email de réinitialisation envoyé." });
  } catch (err) {
    next(err);
  }
};
// ✅ Réinitialiser le mot de passe

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) throw { status: 400, message: "Token et mot de passe requis" };

    const decoded = jwt.verify(token, RESET_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) throw { status: 404, message: "Utilisateur introuvable" };

    user.password = await argon2.hash(password);
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    next({ status: 400, message: "Token invalide ou expiré" });
  }
};
