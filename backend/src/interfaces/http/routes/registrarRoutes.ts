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

const router = Router();

router.get("/get-all-students", authGuard, isRegistrar, getAllStudents);
router.post("/deactivate-users", authGuard, isRegistrar, deactivateUser);

// SUBJECT
router
  .route("/subject")
  .get(authGuard, requireRole("registrar", "student"), getSubject)
  .post(authGuard, isRegistrar, createSubject);

router
  .route("/subject/:subjectId")
  .get(authGuard, requireRole("registrar", "student"), getSubject)
  .patch(authGuard, isRegistrar, updateSubject);

// COURSE
router
  .route("/course")
  .get(authGuard, requireRole("registrar", "student"), getCourse)
  .post(authGuard, isRegistrar, createCourse);

router
  .route("/course/:code")
  .get(authGuard, requireRole("registrar", "student"), getCourse)
  .patch(authGuard, isRegistrar, updateCourse);

// CLASSROOM
router
  .route("/classroom")
  .get(authGuard, requireRole("registrar", "student"), getClassroom)
  .post(authGuard, isRegistrar, createClassroom);

router
  .route("/classroom/:id")
  .get(authGuard, requireRole("registrar", "student"), getClassroom)
  .patch(authGuard, isRegistrar, updateClassroom);

export default router;
