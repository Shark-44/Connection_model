import { sendVerificationEmail } from "../services/mailer.service.js";
import User from "../models/user.model.js";

const MAX_OTP_SEND = 5;
const COOLDOWN_MS = 60000;

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email requis" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    if (user.is_verified)
      return res.status(400).json({ success: false, message: "Compte déjà vérifié" });

    if (user.otp_last_sent && new Date() - user.otp_last_sent < COOLDOWN_MS)
      return res.status(429).json({ success: false, message: "Attendez avant de redemander un code" });

    if (user.otp_send >= MAX_OTP_SEND)
      return res.status(429).json({ success: false, message: "Limite atteinte" });

    // Génération du nouveau code OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Mise à jour en base
    user.otp_code = otp;
    user.otp_expiration = new Date(Date.now() + 10 * 60 * 1000);
    user.otp_last_sent = new Date();
    user.otp_send = (user.otp_send || 0) + 1;

    await user.save();

    // ✅ Envoi du mail avec le même système que sendVerificationEmail
    await sendVerificationEmail(user.email, otp);

    res.status(200).json({ success: true, message: "Nouveau code OTP envoyé" });

  } catch (err) {
    console.error("Erreur resend OTP :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
