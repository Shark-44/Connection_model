import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { Op } from "sequelize";

export const createuser = async (req, res) => {
  try {
    const { username, email, hashedPassword, roles } = req.body;

    if (!username || !email || !hashedPassword) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (roles && roles.length > 0) {
      const rolesDb = await Role.findAll({ where: { name: roles } });
      await user.setRoles(rolesDb);
    }

    res.status(201).json({ message: "Utilisateur créé avec succès", user });
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

