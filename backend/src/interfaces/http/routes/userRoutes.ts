import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import {
  changePassword,
  createProfile,
  getProfile,
  updateProfile,
} from "../controllers/userController";

const router = Router();

router
  .route("/profile")
  .get(authGuard, getProfile)
  .patch(authGuard, updateProfile)
  .post(authGuard, createProfile);

router.route("/change-password").post(authGuard, changePassword);

export default router;
