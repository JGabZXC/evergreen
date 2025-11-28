import { AuthService } from "../../../application/services/authService";
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../../domain/HttpStatus";
import { AuthPayload } from "../../../domain/types/AuthPayload";

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

const authService = new AuthService();

export function authGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies.accessToken ||
    req.headers["authorization"]?.toString().replace("Bearer ", "");
  if (!token) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "No access token provided" });
  }
  const payload = authService.verifyAccessToken(token);
  if (!payload) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid or expired access token" });
  }
  req.user = payload;
  next();
}
