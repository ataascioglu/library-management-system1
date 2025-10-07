// middlewares/logger.js
import winston from "winston";
import morgan from "morgan";

// Winston: detaylı loglama sistemi (dosyaya ve konsola yazar)
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // konsola yaz
    new winston.transports.File({ filename: "logs/app.log" }) // logs klasörüne kaydet
  ],
});

// Morgan: HTTP isteklerini loglar (GET, POST, vs.)
export const httpLogger = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()), // Morgan loglarını Winston’a yönlendir
  },
});
