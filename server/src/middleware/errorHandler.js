import { env } from "../config/env.js";

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "An unexpected error occurred.";
  let errors = Array.isArray(error.errors) ? error.errors : [];

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed.";
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      code: "INVALID_VALUE",
      message: item.message,
    }));
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "A resource with the provided value already exists.";

    const duplicateField = Object.keys(error.keyValue ?? {})[0];

    errors = [
      {
        field: duplicateField,
        code: "DUPLICATE_VALUE",
        message: duplicateField
          ? `${duplicateField} already exists.`
          : "Duplicate value.",
      },
    ];
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
    errors = [
      {
        field: error.path,
        code: "INVALID_OBJECT_ID",
        message: `${error.value} is not a valid identifier.`,
      },
    ];
  }

  if (statusCode === 500) {
    message = "An unexpected error occurred.";
    errors = [];
  }

  if (env.nodeEnv === "development") {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.nodeEnv === "development" && {
      stack: error.stack,
    }),
  });
}