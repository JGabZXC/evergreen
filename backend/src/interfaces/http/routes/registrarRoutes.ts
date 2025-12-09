import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import {
  createCourse,
  creditSubject,
  deactivateUser,
  getCourse,
  updateCourse,
} from "../controllers/registrarController";
import { enrollStudent } from "../controllers/enrollmentController";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import {
  createClassroom,
  getClassroom,
  updateClassroom,
} from "../controllers/classroomController";

const router = Router();

router.post("/deactivate-users", authGuard, isRegistrar, deactivateUser);

// COURSE
router
  .route("/course")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getCourse
  )
  .post(authGuard, isRegistrar, createCourse);

router
  .route("/course/:code")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getCourse
  )
  .patch(authGuard, isRegistrar, updateCourse);

// ENROLLMENT
router.post("/enroll", authGuard, isRegistrar, enrollStudent);
router.post("/credit-subjects", authGuard, isRegistrar, creditSubject);

// CLASSROOM
router
  .route("/classroom")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getClassroom
  )
  .post(authGuard, isRegistrar, createClassroom);

router
  .route("/classroom/:id")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getClassroom
  )
  .patch(authGuard, isRegistrar, updateClassroom);

export default router;
