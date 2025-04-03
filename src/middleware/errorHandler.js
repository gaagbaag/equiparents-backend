import * as Sentry from "@sentry/node";
import { prisma } from "../config/database.js";

const errorHandler = (err, req, res, next) => {
  const errorMap = {
    ValidationError: { status: 400, message: "Datos inválidos" },
    JsonWebTokenError: { status: 401, message: "Token inválido o expirado" },
    TokenExpiredError: { status: 401, message: "Token expirado" },
    NotFoundError: { status: 404, message: "Recurso no encontrado" },
  };

  const { status, message } = errorMap[err.name] || {
    status: err.status || 500,
    message: err.message || "Error interno del servidor",
  };

  if (process.env.ENABLE_SENTRY === "true") {
    Sentry.captureException(err);
  }

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      status,
      message,
      method: req.method,
      path: req.originalUrl,
      stack: err.stack,
    });
  }

  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
