import { Router } from "express";
import {
  createSchoolYear,
  getSchoolYears,
  updateSchoolYear,
} from "../controllers/schoolYearController";
import { authGuard } from "../middleware/authGuard";
import { requireRole } from "../middleware/permissions";
import { StaffRole } from "../../../domain/types/Role";

const router = Router();

// Only Registrar/Admin should manage School Years
router.post(
  "/",
  authGuard,
  requireRole(StaffRole.Registrar, StaffRole.Admin),
  createSchoolYear
);

router.get("/", authGuard, getSchoolYears);

router.patch(
  "/:id",
  authGuard,
  requireRole(StaffRole.Registrar, StaffRole.Admin),
  updateSchoolYear
);

export default router;
