import { HttpStatus } from "../../../domain/HttpStatus";

export class BadRequestError extends Error {
  status: number;
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "BadRequestError";
    this.status = HttpStatus.BAD_REQUEST;
    this.details = details;
    Error.captureStackTrace(this, BadRequestError);
  }
}

export class ForbiddenError extends Error {
  status: number;
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "ForbiddenError";
    this.status = HttpStatus.FORBIDDEN;
    this.details = details;
    Error.captureStackTrace(this, ForbiddenError);
  }
}
