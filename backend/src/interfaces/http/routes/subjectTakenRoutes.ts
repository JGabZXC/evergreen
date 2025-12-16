import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import {
  getSubjectTaken,
  updateSubjectTaken,
} from "../controllers/subjectTakenController";

const router = Router();

router.use(authGuard);

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
