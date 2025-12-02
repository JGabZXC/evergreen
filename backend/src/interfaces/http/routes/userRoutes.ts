import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "../controllers/userController";

const router = Router();

router
  .route("/profile")
  .get(authGuard, getProfile)
  .patch(authGuard, updateProfile);

router.route("/change-password").post(authGuard, changePassword);

export default router;
