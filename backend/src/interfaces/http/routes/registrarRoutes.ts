import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import {
  creditSubject,
  deactivateUser,
} from "../controllers/registrarController";
import { enrollStudent } from "../controllers/enrollmentController";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import {
  getSection,
  updateSection,
  createSection,
} from "../controllers/sectionController";

const router = Router();

router.post("/deactivate-users", authGuard, isRegistrar, deactivateUser);

// ENROLLMENT
router.post("/enroll", authGuard, isRegistrar, enrollStudent);
router.post("/credit-subjects", authGuard, isRegistrar, creditSubject);

// SECTION
router
  .route("/sections")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getSection
  )
  .post(authGuard, isRegistrar, createSection);

router
  .route("/sections/:id")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getSection
  )
  .patch(authGuard, isRegistrar, updateSection);

export default router;
