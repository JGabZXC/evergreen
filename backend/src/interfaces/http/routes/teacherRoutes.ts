import {Router} from "express";
import {authGuard} from "../middleware/authGuard";
import {isRegistrar} from "../middleware/permissions";
import {getMySections, getTeacher, updateGrade} from "../controllers/teacherController";

const router = Router();

router.use(authGuard);
router.route("/grade").patch(updateGrade);

router.route("/").get(isRegistrar, getTeacher);
router.route("/me").get(getTeacher);

router.route("/:teacherId").post(isRegistrar, getTeacher);

router.route("/my-sections").get(getMySections);

export default router;
