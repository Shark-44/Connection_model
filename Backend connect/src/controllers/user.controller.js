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
    
    // Générer UNIQUEMENT un access token court (1h)
    const { token: accessToken, jti: accessJti } = generateToken(user, "1h");
    
    // Stocker le jti du token court en base
    await Token.create({
      userId: user.id,
      jti: accessJti,
      hashToken: accessToken,
      revoked: false,
      expiresAt: new Date(Date.now() + 1*60*1000) // 1h
    });
    
    return res.status(200)
    .cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1h
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
    // On récupère le token actuel (peu importe s'il est court ou long)
    const authToken = req.cookies?.auth_token;
    
    if (!authToken) {
      return res.status(200).json({ message: "Déjà déconnecté" });
    }
    
    // Décoder pour récupérer le JTI
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    
    // Révoquer le token via son JTI
    await Token.update(
      { revoked: true },
      { where: { jti: decoded.jti, revoked: false } }
    );
    
    // Supprimer les cookies côté client
    res
      .clearCookie("auth_token", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax" 
      })
      .clearCookie("userId", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax" 
      })
      .status(200)
      .json({ message: "Déconnexion réussie" });
      
  } catch (err) {
    // Si le token est invalide/expiré, on nettoie quand même les cookies
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .clearCookie("auth_token")
        .clearCookie("userId")
        .status(200)
        .json({ message: "Déconnexion réussie" });
    }
    next(err);
  }
};


