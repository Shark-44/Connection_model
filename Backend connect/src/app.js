import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import cors from 'cors';
import sequelize from "./config/database.js";
import morgan from 'morgan';
import helmet from 'helmet';
import { User, Role, UserRole } from "./models/userRole.model.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/authRoutes.js";
import authVerify from "./routes/authVerifyRoutes.js";
import consentRoutes from "./routes/consentRoutes.js";
import { startTokenCleaner } from "./cron/tokenCleaner.js";
import "./models/associations.js";
import { v4 as uuidv4 } from 'uuid';
import logger from './utils/logger.js';




dotenv.config();
const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
// Generer un traceID
app.use((req, res, next) => {
  global.currentTraceId = uuidv4(); // Génère un ID unique
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} [${duration}ms]`);
  });
  next();
});


app.use(helmet());


// Test route
app.get("/", (req, res) => res.send("API en ligne "));

// Routes
app.use("/", userRoutes);
app.use("/auth", authRoutes); 
app.use("/auth-verify", authVerify);
app.use("/consent", consentRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(" Erreur attrapée par le ErrorHandler :", err);
  logger.error(`Erreur : ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
  });
});

// Synchronisation base
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ Base synchronisée avec succès"))
  .catch((err) => console.error("Erreur de connexion DB:", err));

// Lancement du cron apres initialisation de la bdd
  startTokenCleaner();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur en écoute sur le port ${PORT}`));
