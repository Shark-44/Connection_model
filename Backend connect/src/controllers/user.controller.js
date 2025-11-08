import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import generateOTP from "../utils/generateOTP.js";
import { sendVerificationEmail } from "../services/mailer.service.js";

// ---------------------------------------------------------
// ✅ Création d’un utilisateur (register)
// ---------------------------------------------------------
export const createuser = async (req, res) => {
  try {
    const { username, email, hashedPassword, roles } = req.body;

    if (!username || !email || !hashedPassword)throw { status: 400, message: "Champs requis manquants" };

    // ✅ Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw { status: 409, message: "Email déjà utilisé" };

    // ✅ Générer OTP + expiration
    const otp = generateOTP();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // ✅ Création de l'utilisateur non vérifié
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      is_verified: false,
      otp_code: otp,
      otp_expiration: expiration,
      otp_send: 1,
      otp_last_sent: new Date(),
    });

    // ✅ Assigner les rôles
    if (roles && roles.length > 0) {
      const rolesDb = await Role.findAll({ where: { name: roles } });
      await user.setRoles(rolesDb);
    }

    // ✅ Envoyer email OTP
    await sendVerificationEmail(email, otp);

    res.status(201).json({ message: "Utilisateur créé. Code de vérification envoyé par email." });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------
// ✅ Connexion (login)
// ---------------------------------------------------------
export const login = async (req, res, next) => {
  try {
    const { user, token } = req;
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------
// ✅ Déconnexion (logout)
// ---------------------------------------------------------
export const logout = (req, res, next) => {
  try {
    res
      .clearCookie("auth_token", { httpOnly: true, secure: true, sameSite: "strict" })
      .clearCookie("userId", { httpOnly: true, secure: true, sameSite: "strict" })
      .status(200)
      .json({ message: "Déconnexion réussie" });
  } catch (err) {
    next(err);
  }
};