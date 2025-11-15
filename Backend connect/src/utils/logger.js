// src/utils/logger.js
import winston from "winston";
import path from "path";

const logDir = "logs";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    // Logs des erreurs
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    // Logs de tout (infos, warnings, etc.)
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// Affichage en console en dev
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
