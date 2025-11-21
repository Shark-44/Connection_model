// src/utils/logger.js
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
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
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",  // 14 jours pour les erreurs (plus important)
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d",
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
