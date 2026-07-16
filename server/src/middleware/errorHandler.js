import { env } from "../config/env.js";

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  console.error(error);

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "An unexpected error occurred."
        : error.message,
    errors: [],
    ...(env.nodeEnv === "development" && {
      stack: error.stack,
    }),
  });
}