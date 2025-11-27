import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../../../domain/HttpStatus";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function authenticateToken(
  req: Request,
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
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: "Invalid or expired access token" });
  }
}
