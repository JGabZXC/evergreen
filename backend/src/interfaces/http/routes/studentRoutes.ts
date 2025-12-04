import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isStudent } from "../middleware/permissions";
import { getMyGrades } from "../controllers/studentController";

const router = Router();

router.route("/my-grades").get(authGuard, isStudent, getMyGrades);

export default router;
