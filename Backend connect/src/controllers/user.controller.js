import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import generateOTP from "../utils/generateOTP.js";
import Token from "../models/Token.js";
import jwt from "jsonwebtoken";
import UserConsent from "../models/userConsent.js";
import { sendVerificationEmail } from "../services/mailer.service.js";
import { generateToken } from "../middlewares/auth.js";
import { setConsent } from "./consent.controller.js"; 


// ---------------------------------------------------------
// ✅ Création d’un utilisateur (register)
// ---------------------------------------------------------
export const createuser = async (req, res, next) => {
  try {
    const { username, email, hashedPassword, roles, cookieConsent, marketingConsent } = req.body;
    console.log("user.controller ", username, email, hashedPassword )
    if (!username || !email || !hashedPassword) {
      throw { status: 400, message: "Champs requis manquants" };
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw { status: 409, message: "Email déjà utilisé" };

    // Générer OTP + expiration
    const otp = generateOTP();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Création de l'utilisateur non vérifié
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

    // Assigner les rôles
    if (roles && roles.length > 0) {
      const rolesDb = await Role.findAll({ where: { name: roles } });
      await user.setRoles(rolesDb);
    }

    // Enregistrer le consentement (si fourni)
    await setConsent(user.id, cookieConsent ?? null, marketingConsent ?? null);

    // Envoyer email OTP
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      message: "Utilisateur créé. Code de vérification envoyé par email.",
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------
// ✅ Connexion (login)
// ---------------------------------------------------------
export const login = async (req, res, next) => {
  try {
    const user = req.user;
    const { cookieConsent, marketingConsent } = req.body; 

    // Mettre à jour le consentement si fourni
    if (cookieConsent !== undefined || marketingConsent !== undefined) {
      await setConsent(user.id, cookieConsent ?? null, marketingConsent ?? null);
    }

    // Générer le JWT + jti
    const { token, jti } = generateToken(user);

    // Stocker le jti en base
    await Token.create({
      userId: user.id,
      jti,
      revoked: false,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1h = durée du token
    });

    return res.status(200)
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Connexion réussie",
        user: { id: user.id, username: user.username, email: user.email },
      });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------
// ✅ Déconnexion (logout)
// ---------------------------------------------------------
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) return res.status(200).json({ message: "Déjà déconnecté" });

    // Décoder le token pour récupérer le jti
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const jti = decoded.jti;

    // Révoquer le token en base
    await Token.update(
      { revoked: true },
      { where: { jti } }
    );

    res
      .clearCookie("auth_token", { httpOnly: true, secure: true, sameSite: "strict" })
      .clearCookie("userId", { httpOnly: true, secure: true, sameSite: "strict" })
      .status(200)
      .json({ message: "Déconnexion réussie" });
  } catch (err) {
    next(err);
  }
};
