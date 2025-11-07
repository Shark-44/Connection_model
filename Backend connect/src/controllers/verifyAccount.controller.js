import User from "../models/user.model.js";

export const verifyAccount = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw { status: 400, message: "Email et code requis" };

    const user = await User.findOne({ where: { email } });
    if (!user) throw { status: 426, message: "Utilisateur introuvable" };
    if (user.is_verified) throw { status: 427, message: "Compte déjà vérifié" };
    if (user.otp_code !== otp) throw { status: 428, message: "Code invalide" };
    if (user.otp_expiration < new Date()) throw { status: 429, message: "Code expiré" };

    await user.update({ is_verified: true, otp_code: null, otp_expiration: null });
    res.status(200).json({ success: true, message: "Compte vérifié avec succès" });
  } catch (err) {
    next(err);
  }
};
