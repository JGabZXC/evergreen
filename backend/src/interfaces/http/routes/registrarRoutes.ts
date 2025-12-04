import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import {
  createClassroom,
  createCourse,
  createSubject,
  deactivateUser,
  getAllStudents,
  getClassroom,
  getCourse,
  getSubject,
  updateClassroom,
  updateCourse,
  updateSubject,
} from "../controllers/registrarController";
import {
  enrollStudent,
  // transferStudentSection,
} from "../controllers/enrollmentController";
import { StaffRole, StudentRole } from "../../../domain/types/Role";

const router = Router();

router.get("/get-all-students", authGuard, isRegistrar, getAllStudents);
router.post("/enroll-student", authGuard, isRegistrar, enrollStudent);
router.post("/deactivate-users", authGuard, isRegistrar, deactivateUser);

// SUBJECT
router
  .route("/subject")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getSubject
  )
  .post(authGuard, isRegistrar, createSubject);

router
  .route("/subject/:subjectId")
  .get(
    authGuard,
    requireRole(StaffRole.Registrar, StudentRole.Student),
    getSubject
  )
  .patch(authGuard, isRegistrar, updateSubject);

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

// ENROLLMENT
router.post("/enroll", authGuard, isRegistrar, enrollStudent);
// router.post("/transfer", authGuard, isRegistrar, transferStudentSection);

export default router;
