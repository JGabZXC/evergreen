import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar } from "../middleware/permissions";
import { getTeacher, updateGrade } from "../controllers/teacherController";

const router = Router();

router.route("/grade").patch(authGuard, updateGrade);

router.route("/").get(authGuard, isRegistrar, getTeacher);
router.route("/me").get(authGuard, getTeacher);

router.route("/:teacherId").post(authGuard, isRegistrar, getTeacher);

export default router;
