import express from "express";
import logger from "../utils/logger.js"; 
import {
  updateConsent,
  requestRightToBeForgotten,
} from "../controllers/consent.controller.js";
import { checkToken } from "../middlewares/auth.js";
//import { checkToken } from "../middlewares/auth.js"; // Middleware pour vérifier l'authentification

const router = express.Router();

// Mettre à jour un consentement (nécessite d'être connecté)
router.post("/update-consent", checkToken, (req, res, next) => {
  logger.info("Mise a jour des consentements", { userId: req.user?.sub });
  next();
},  updateConsent);

// Demander le droit à l'oubli (nécessite d'être connecté)
router.post("/right-to-be-forgotten", requestRightToBeForgotten);

export default router;
