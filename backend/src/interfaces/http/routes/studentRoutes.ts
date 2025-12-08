import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar, isStudent } from "../middleware/permissions";
import { getMyGrades, getStudents } from "../controllers/studentController";

const router = Router();

router.get("/", authGuard, isRegistrar, getStudents);
router.get("/:id", authGuard, isRegistrar, getStudents);

router.route("/my-grades").get(authGuard, isStudent, getMyGrades);

export default router;
