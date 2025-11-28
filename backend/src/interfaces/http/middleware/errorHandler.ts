import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { BadRequestError } from "./HttpErrors";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default error shape
  let status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let details = err.details || undefined;

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
