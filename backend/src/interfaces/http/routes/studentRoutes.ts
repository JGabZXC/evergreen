import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, isStudent, isTeacher } from "../middleware/permissions";
import {
  getMyGrades,
  getStudents,
  updateProfile,
  updateProfileByRegistrar,
  getEnrollmentHistory,
  getMyProfile,
  getStudentSchedule,
  getStudentsByTeacher,
} from "../controllers/studentController";

const router = Router();

router
  .route("/profile")
  .get(authGuard, isStudent, getMyProfile)
  .patch(authGuard, isStudent, updateProfile);
router.route("/my-schedule").get(authGuard, isStudent, getStudentSchedule);
router.route("/my-grades").get(authGuard, isStudent, getMyGrades);
router.get("/my-students", authGuard, isTeacher, getStudentsByTeacher);

router.get("/", authGuard, isRegistrar, getStudents);

// Specific ID sub-routes must be defined before generic /:id
router.patch("/:id/profile", authGuard, isRegistrar, updateProfileByRegistrar);
router.get("/:id/enrollment-history", authGuard, isRegistrar, getEnrollmentHistory);

router.get("/:id", authGuard, isRegistrar, getStudents);

export default router;
