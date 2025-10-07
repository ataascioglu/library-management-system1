import { logger } from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  logger.error(`${err.stack}`);
  res.status(500).json({ message: err.message });
};
