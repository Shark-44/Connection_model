// src/routes/userRoutes.js
import express from "express";
import { createuser, login, logout } from "../controllers/user.controller.js";
import { hashPassword, verifyPassword } from "../middlewares/auth.js";

const router = express.Router();

// création d’un utilisateur avec hash du mot de passe
router.post("/admin-user", hashPassword, createuser);

router.post("/login", verifyPassword, login);

router.post("/logout", logout);

export default router;
