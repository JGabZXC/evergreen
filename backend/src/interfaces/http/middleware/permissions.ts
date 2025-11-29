import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authGuard";
import { ForbiddenError } from "./HttpErrors";

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  };
}

export const isAdmin = requireRole("admin");
export const isRegistrar = requireRole("registrar");
export const isTeacher = requireRole("teacher");
export const isStudent = requireRole("student");
export const isStaff = requireRole("staff");
