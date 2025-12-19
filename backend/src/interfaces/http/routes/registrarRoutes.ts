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
  getSectionStudents,
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
    requireRole(StaffRole.Registrar, StudentRole.Student, StaffRole.Teacher),
    getSection
  )
  .post(authGuard, isRegistrar, createSection);

router
  .route("/sections/:id")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student, StaffRole.Teacher),
    getSection
  )
  .patch(authGuard, isRegistrar, updateSection);

router.get(
  "/sections/:id/students",
  authGuard,
  requireRole(StaffRole.Registrar, StaffRole.Teacher),
  getSectionStudents
);

export default router;
