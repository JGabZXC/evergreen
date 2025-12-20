import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import {
  getSchedule,
  createSchedule,
  updateSchedule,
} from "../controllers/scheduleController";
import { StaffRole, StudentRole } from "../../../domain/types/Role";

const router = Router();

router
  .route("/")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StaffRole.Teacher, StudentRole.Student),
    getSchedule
  )
  .post(authGuard, isRegistrar, createSchedule);

router
  .route("/:id")
  .get(authGuard, isRegistrar, getSchedule)
  .patch(authGuard, isRegistrar, updateSchedule);

export default router;
