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

export class NotFoundError extends Error {
  status: number;
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "NotFoundError";
    this.status = HttpStatus.NOT_FOUND;
    this.details = details;
    Error.captureStackTrace(this, NotFoundError);
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

export class UnauthorizedError extends Error {
  status: number;
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "UnauthorizedError";
    this.status = HttpStatus.UNAUTHORIZED;
    this.details = details;
    Error.captureStackTrace(this, UnauthorizedError);
  }
}

export class ConflictError extends Error {
  status: number;
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "ConflictError";
    this.status = HttpStatus.CONFLICT;
    this.details = details;
    Error.captureStackTrace(this, ConflictError);
  }
}
