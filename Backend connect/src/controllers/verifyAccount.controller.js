import User from "../models/user.model.js";
export const verifyAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email et code requis" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    if (user.is_verified)
      return res.status(400).json({ success: false, message: "Compte déjà vérifié" });

    if (user.otp_code !== otp)
      return res.status(401).json({ success: false, message: "Code invalide" });

    if (user.otp_expiration < new Date())
      return res.status(401).json({ success: false, message: "Code expiré" });

    // ✅ Validation
    user.is_verified = true;
    user.otp_code = null;
    user.otp_expiration = null;
    await user.save();

    res.status(200).json({ success: true, message: "Compte vérifié avec succès" });
  } catch (err) {
    console.error("Erreur vérification compte :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
