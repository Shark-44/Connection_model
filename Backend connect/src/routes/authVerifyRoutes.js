import express from "express";
import { verifyAccount } from "../controllers/verifyAccount.controller.js";
import { resendOtp } from "../controllers/resendOtp.controller.js";

const router = express.Router();

// POST /auth-verify → vérification OTP
router.post("/verify", verifyAccount);

// POST /auth-verify/resend → renvoyer un nouveau code OTP
router.post("/resend", resendOtp);

export default router;
