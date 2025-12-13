import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar } from "../middleware/permissions";
import {
  getSchedule,
  createSchedule,
  updateSchedule,
} from "../controllers/scheduleController";

const router = Router();

router
  .route("/")
  .get(authGuard, isRegistrar, getSchedule)
  .post(authGuard, isRegistrar, createSchedule);

router
  .route("/:id")
  .get(authGuard, isRegistrar, getSchedule)
  .patch(authGuard, isRegistrar, updateSchedule);

export default router;
