import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import { isRegistrar, requireRole } from "../middleware/permissions";
import {
  createSubject,
  getSubject,
  updateSubject,
} from "../controllers/subjectController";

const router = Router();

router
  .route("/")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getSubject
  )
  .post(authGuard, isRegistrar, createSubject);

router
  .route("/:subjectId")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getSubject
  )
  .patch(authGuard, isRegistrar, updateSubject);

export default router;
