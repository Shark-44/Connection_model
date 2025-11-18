// src/utils/logger.js
import winston from "winston";
import path from "path";


const logDir = "logs";

const traceIdFormat = winston.format((info) => {
  // Ajoute un champ traceId dans les logs
  info.traceId = global.currentTraceId || "no-trace";
  return info;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    traceIdFormat(),              // <<< AJOUT IMPORTANT
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// Console en dev
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        traceIdFormat(),            // <<< AJOUT IMPORTANT POUR LA CONSOLE AUSSI
        winston.format.simple()
      ),
    })
  );
}

export default logger;
