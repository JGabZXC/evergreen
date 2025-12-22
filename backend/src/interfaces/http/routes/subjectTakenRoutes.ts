import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import {
  getSubjectTaken,
  updateSubjectTaken,
  batchGradeSubjectTaken,
} from "../controllers/subjectTakenController";

const router = Router();

router.use(authGuard);

router.patch(
  "/batch-grade",
  requireRole(StaffRole.Registrar, StaffRole.Teacher),
  batchGradeSubjectTaken
);

router
  .route("/")
  .get(
    requireRole(StaffRole.Registrar, StudentRole.Student, StaffRole.Teacher),
    getSubjectTaken
  );

router
  .route("/:id")
  .get(
    requireRole(StaffRole.Registrar, StudentRole.Student, StaffRole.Teacher),
    getSubjectTaken
  )
  .patch(
    requireRole(StaffRole.Registrar, StaffRole.Teacher),
    updateSubjectTaken
  );

export default router;
