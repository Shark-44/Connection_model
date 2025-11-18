// src/routes/userRoutes.js
import express from "express";
import { createuser, login, logout } from "../controllers/user.controller.js";
import { hashPassword, verifyPassword } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/user.validator.js";
import { refreshToken } from "../controllers/token.controller.js";
import logger from "../utils/logger.js";

const router = express.Router();

// création d’un utilisateur avec hash du mot de passe
router.post("/admin-user",validate(registerSchema), hashPassword, createuser);

router.post("/login",validate(loginSchema), verifyPassword, (req, res, next) => {
    logger.info("Tentative de login", { userId: req.user?.id });
    next();
  }, login);

router.post("/logout", (req, res, next) => {
    logger.info("Demande de logout", { userId: req.user?.id });
    next();
  }, logout);

router.post("/refresh-token", refreshToken);


export default router;