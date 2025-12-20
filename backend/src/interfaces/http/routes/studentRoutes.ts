import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, isStudent } from "../middleware/permissions";
import {
  getMyGrades,
  getStudents,
  updateProfile,
  getMyProfile,
  getStudentSchedule,
} from "../controllers/studentController";

const router = Router();

router
  .route("/profile")
  .get(authGuard, isStudent, getMyProfile)
  .patch(authGuard, isStudent, updateProfile);
router.route("/my-schedule").get(authGuard, isStudent, getStudentSchedule);
router.route("/my-grades").get(authGuard, isStudent, getMyGrades);

router.get("/", authGuard, isRegistrar, getStudents);
router.get("/:id", authGuard, isRegistrar, getStudents);

export default router;
