import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar } from "../middleware/permissions";
import { getSchedule, updateSchedule } from "../controllers/scheduleController";

const router = Router();

router
  .route("/")
  .get(authGuard, isRegistrar, getSchedule)
  .post(authGuard, isRegistrar, updateSchedule);

router.route("/:id").get(authGuard, isRegistrar, getSchedule);

export default router;
