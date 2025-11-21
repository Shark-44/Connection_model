// src/utils/logger.js
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

import { AsyncLocalStorage } from "node:async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage();

const logDir = "logs";

const traceIdFormat = winston.format((info) => {
  // Ajoute un champ traceId dans les logs via AsyncLocalStorage
  const store = asyncLocalStorage.getStore();
  info.traceId = store?.get("traceId") || "no-trace";
  return info;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    traceIdFormat(),              // <<< AJOUT IMPORTANT
    winston.format((info) => {
      const maskEmail = (text) => {
        if (typeof text !== 'string') return text;
        return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (email) => {
          const [user, domain] = email.split('@');
          return `${user.charAt(0)}***@${domain}`;
        });
      };

      if (info.message) {
        info.message = maskEmail(info.message);
      }

      // Mask sensitive data in metadata
      for (const key in info) {
        // Mask emails
        if (key !== 'message' && key !== 'level' && key !== 'timestamp' && typeof info[key] === 'string') {
          info[key] = maskEmail(info[key]);
        }

        // Remove or mask JTI
        if (key === 'jti') {
          info[key] = '***MASKED***';
        }
      }
      return info;
    })(),
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
