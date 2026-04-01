import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authGuard";
import { ForbiddenError } from "./HttpErrors";
import {Role} from "../../../generated/prisma/enums";

/**
 * Permissions middleware provider.
 *
 * Usage:
 *  router.get("/admin", Permissions.isAdmin, handler);
 */
export class Permissions {
  static requireRole(...roles: Role[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new ForbiddenError("Insufficient permissions");
      }
      next();
    };
  }

  // Convenience getters that return middleware functions
  static get isAdmin() {
    return Permissions.requireRole(Role.ADMIN);
  }

  static get isRegistrar() {
    return Permissions.requireRole(Role.REGISTRAR);
  }

  static get isTeacher() {
    return Permissions.requireRole(Role.TEACHER);
  }

  static get isStudent() {
    return Permissions.requireRole(Role.STUDENT);
  }
}
