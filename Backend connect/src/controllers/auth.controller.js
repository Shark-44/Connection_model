import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { sendResetEmail } from "../services/mailer.service.js";

const RESET_SECRET = process.env.RESET_SECRET || "secret_reset_token";

// Mot de passe oublié
export const forgotPassword = async (req, res) => {
  
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(200).json({ message: "Si un compte existe, un mail a été envoyé." });

    // Générer un token JWT valable 15 min
    const token = jwt.sign({ id: user.id }, RESET_SECRET, { expiresIn: "15m" });
   
    // Envoi du mail (test)
    
    await sendResetEmail(user.email, token);
    console.log("✅ Mail envoyé !");

    res.json({ message: "Email de réinitialisation envoyé." });
  } catch (err) {
    console.error("Erreur forgotPassword:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//  Réinitialiser le mot de passe
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token et mot de passe requis" });

    const decoded = jwt.verify(token, RESET_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    user.password = await argon2.hash(password);
    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("Erreur resetPassword:", err);
    res.status(400).json({ message: "Token invalide ou expiré" });
  }
};
