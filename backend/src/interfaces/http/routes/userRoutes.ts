import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import {
  changePassword,
  getUser,
  updateProfile,
} from "../controllers/userController";
import { requireRole } from "../middleware/permissions";
import { StaffRole } from "../../../domain/types/Role";

const router = Router();

router.route("/change-password").post(authGuard, changePassword);

router
  .route("/profile")
  .get(authGuard, getUser)
  .patch(authGuard, updateProfile);

router
  .route("/")
  .get(authGuard, requireRole(StaffRole.Registrar, StaffRole.Admin), getUser);
router.route("/:id").get(authGuard, getUser).patch(authGuard, updateProfile);

export default router;
