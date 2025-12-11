import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import {
  createCourse,
  getCourse,
  updateCourse,
} from "../controllers/courseController";
import { StaffRole, StudentRole } from "../../../domain/types/Role";

const router = Router();

router
  .route("/")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getCourse
  )
  .post(authGuard, isRegistrar, createCourse);

router
  .route("/:code")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getCourse
  )
  .patch(authGuard, isRegistrar, updateCourse);

export default router;
