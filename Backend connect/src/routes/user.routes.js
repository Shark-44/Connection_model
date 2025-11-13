// src/routes/userRoutes.js
import express from "express";
import { createuser, login, logout } from "../controllers/user.controller.js";
import { hashPassword, verifyPassword } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/user.validator.js";
import { refreshToken } from "../controllers/token.controller.js";

const router = express.Router();

// création d’un utilisateur avec hash du mot de passe
router.post("/admin-user",validate(registerSchema), hashPassword, createuser);

router.post("/login",validate(loginSchema), verifyPassword, login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);


export default router;