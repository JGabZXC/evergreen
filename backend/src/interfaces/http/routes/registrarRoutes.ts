import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, requireRole } from "../middleware/permissions";
import {
  createCourse,
  deactivateUser,
  getStudents,
  getCourse,
  updateCourse,
} from "../controllers/registrarController";
import {
  enrollStudent,
  // transferStudentSection,
} from "../controllers/enrollmentController";
import { StaffRole, StudentRole } from "../../../domain/types/Role";
import {
  createClassroom,
  getClassroom,
  updateClassroom,
} from "../controllers/classroomController";
import { updateSchedule } from "../controllers/scheduleController";

const router = Router();

router.get("/students", authGuard, isRegistrar, getStudents);
router.get("/students/:id", authGuard, isRegistrar, getStudents);
router.post("/enroll-student", authGuard, isRegistrar, enrollStudent);
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
