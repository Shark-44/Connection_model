import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import generateOTP from "../utils/generateOTP.js";
import { sendVerificationEmail } from "../services/mailer.service.js";

export const createuser = async (req, res) => {
  try {
    const { username, email, hashedPassword, roles } = req.body;

    if (!username || !email || !hashedPassword) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

     // Vérifier si l'email existe déjà
     const existingEmail = await User.findOne({ where: { email } });
     if (existingEmail) {
       return res.status(409).json({ message: "Email déjà utilisé" });
     }
 
     /* Vérifier si le nom d’utilisateur existe déjà (optionnel mais souvent utile)
     const existingUsername = await User.findOne({ where: { username } });
     if (existingUsername) {
       return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
     }*/

     // Générer le code OTP
     const otp = generateOTP();
     const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 min
     
    console.log("OTP généré :", otp);
    console.log("Expiration :", expiration);
     
     // Création de l'utilisateur non vérifié
     const user = await User.create({
       username,
       email,
       password: hashedPassword,
       is_verified: false,
       otp_code: otp,
       otp_expiration: expiration,
     });

    if (roles && roles.length > 0) {
      const rolesDb = await Role.findAll({ where: { name: roles } });
      await user.setRoles(rolesDb);
    }

    // Envoi du mail
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      message: "Utilisateur créé. Un code de vérification a été envoyé par email.",
    });
  } catch (err) {
    console.error("Erreur création utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const login = async (req, res) => {
  try {
    const { user, token } = req;

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Erreur connexion :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("auth_token", { httpOnly: true, secure: true, sameSite: "strict" })
    .clearCookie("userId", { httpOnly: true, secure: true, sameSite: "strict" })
    .status(200)
    .json({ message: "Déconnexion réussie" });
};

