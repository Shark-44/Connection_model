import { sendVerificationEmail } from "../services/mailer.service.js";
import User from "../models/user.model.js";
import generateOTP from "../utils/generateOTP.js";

const MAX_OTP_SEND = 5;
const COOLDOWN_MS = 60000;

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw { status: 400, message: "Email requis" };

    const user = await User.findOne({ where: { email } });
    if (!user) throw { status: 404, message: "Utilisateur introuvable" };
    if (user.is_verified) throw { status: 400, message: "Compte déjà vérifié" };
    if (user.otp_last_sent && new Date() - user.otp_last_sent < COOLDOWN_MS)
      throw { status: 429, message: "Attendez avant de redemander un code" };
    if (user.otp_send >= MAX_OTP_SEND) throw { status: 429, message: "Limite de renvois OTP atteinte" };

    const otp = generateOTP();
    await user.update({
      otp_code: otp,
      otp_expiration: new Date(Date.now() + 10 * 60 * 1000),
      otp_last_sent: new Date(),
      otp_send: (user.otp_send || 0) + 1,
    });

    await sendVerificationEmail(user.email, otp);

    res.status(200).json({ success: true, message: "Nouveau code OTP envoyé" });
  } catch (err) {
    next(err);
  }
};
