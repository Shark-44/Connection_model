import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import sequelize from "./config/database.js";
import { User, Role, UserRole } from "./models/userRole.model.js";
import userRoutes from "./routes/user.routes.js";


dotenv.config();
const app = express();
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

// Test route
app.get("/", (req, res) => res.send("API en ligne 🚀"));

// Routes
app.use("/", userRoutes);

// Synchronisation base
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ Base synchronisée avec succès"))
  .catch((err) => console.error("Erreur de connexion DB:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur en écoute sur le port ${PORT}`));
