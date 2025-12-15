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
  .get(requireRole(StaffRole.Registrar, StudentRole.Student), getSubjectTaken);

router
  .route("/:id")
  .get(requireRole(StaffRole.Registrar, StudentRole.Student), getSubjectTaken)
  .patch(isRegistrar, updateSubjectTaken);
export default router;
