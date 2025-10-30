import User from "../models/user.model.js";
import Role from "../models/role.model.js";

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
