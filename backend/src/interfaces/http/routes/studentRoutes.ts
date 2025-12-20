import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, isStudent } from "../middleware/permissions";
import {
  getMyGrades,
  getStudents,
  updateProfile,
  getMyProfile,
} from "../controllers/studentController";

const router = Router();

router.patch("/profile", authGuard, isStudent, updateProfile);
router.get("/profile", authGuard, isStudent, getMyProfile);
router.route("/my-grades").get(authGuard, isStudent, getMyGrades);

router.get("/", authGuard, isRegistrar, getStudents);
router.get("/:id", authGuard, isRegistrar, getStudents);

export default router;
