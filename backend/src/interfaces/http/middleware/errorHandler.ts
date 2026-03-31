import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../../domain/enums/HttpStatus";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Default error shape
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";
  const details = err.details || undefined;

  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", err);
  }

  res.status(status).json({
    error: {
      message,
      details,
    },
  });
}
