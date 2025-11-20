import express from "express";
import { forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.post("/forgot-password",  (req, res, next) => {
    logger.info("Demande de reinitialisation de mot de passe");
    next();
  }, forgotPassword);
router.post("/reset-password",(req, res, next) => {
    logger.info("Execution du renouvellement du mot de passe");
    next();
  }, resetPassword);

export default router;