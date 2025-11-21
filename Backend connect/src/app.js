import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import cors from 'cors';
import sequelize from "./config/database.js";
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import logger from './utils/logger.js';

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/authRoutes.js";
import authVerify from "./routes/authVerifyRoutes.js";
import consentRoutes from "./routes/consentRoutes.js";
import { startTokenCleaner } from "./cron/tokenCleaner.js";
import "./models/associations.js";

dotenv.config();
const app = express();

// === Middleware de sécurité et parsing ===
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(helmet());

// === Middleware TraceId par requête (stable avec global) ===
app.use((req, res, next) => {
  global.currentTraceId = uuidv4();
  next();
});

// === Middleware de log des requêtes ===
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const traceId = global.currentTraceId || "no-trace";
    const userId = req.user?.sub || "anonymous";

    const logData = {
      traceId,
      userId,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration
    };

    const level = res.statusCode >= 500 ? 'error' :
                  res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, `${req.method} ${req.originalUrl} ${res.statusCode} [${duration}ms]`, logData);
  });
  next();
});

// === Test route ===
app.get("/", (req, res) => res.send("API en ligne"));

// === Routes ===
app.use("/", userRoutes);
app.use("/auth", authRoutes); 
app.use("/auth-verify", authVerify);
app.use("/consent", consentRoutes);

// === Middleware ErrorHandler centralisé ===
app.use((err, req, res, next) => {
  const traceId = global.currentTraceId || "no-trace";
  const userId = req.user?.sub || "anonymous";

  const level = err.status && err.status < 500 ? 'warn' : 'error';

  logger.log(level, `Erreur : ${err.message}`, {
    traceId,
    userId,
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    status: err.status || 500,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
  });
});

// === Synchronisation DB ===
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ Base synchronisée avec succès"))
  .catch((err) => console.error("Erreur de connexion DB:", err));

// === Lancement du cron ===
startTokenCleaner();

// === Démarrage du serveur ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur en écoute sur le port ${PORT}`));
