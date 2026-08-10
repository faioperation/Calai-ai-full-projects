import { Prisma } from "@prisma/client";
import { AppError } from "../errorHelper/appError.js";
import { envVars } from "../config/env.js";

export const globalErrorHandler = (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.error(err);
  }

  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSource = [];

  // ✅ Prisma Known Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = `Duplicate value for ${err.meta?.target}`;
        break;

      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;

      case "P2003":
        statusCode = 400;
        message = "Invalid foreign key reference";
        break;

      default:
        statusCode = 400;
        message = err.message;
    }
  }

  // ✅ Prisma Validation Errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = err.message;
  }

  // ✅ Custom App Error
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // ✅ Native Error
  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errorSource,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
