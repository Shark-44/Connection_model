// src/routes/userRoutes.js
import express from "express";
import { createuser } from "../controllers/user.controller.js";
import { hashPassword } from "../middlewares/auth.js";

const router = express.Router();

// création d’un utilisateur avec hash du mot de passe
router.post("/admin-user", hashPassword, createuser);

export default router;
