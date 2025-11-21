import express from "express";
import { verifyAccount } from "../controllers/verifyAccount.controller.js";
import { resendOtp } from "../controllers/resendOtp.controller.js";
import logger from "../utils/logger.js";

const router = express.Router();

// POST /auth-verify → vérification OTP
router.post("/verify", (req, res, next) => {
    logger.info("Mise a jour d'un compte verifie apres 2FA");
    next();
  }, verifyAccount);

// POST /auth-verify/resend → renvoyer un nouveau code OTP
router.post("/resend", (req, res, next) => {
    logger.info("Demande de renvoi d'un code 2FA");
    next();
  }, resendOtp);

export default router;
