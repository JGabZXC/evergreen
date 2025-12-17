import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import {
  changePassword,
  getUser,
  updateProfile,
} from "../controllers/userController";

const router = Router();

router.route("/change-password").post(authGuard, changePassword);

router
  .route("/profile")
  .get(authGuard, getUser)
  .patch(authGuard, updateProfile);

router.route("/:id").get(authGuard, getUser).patch(authGuard, updateProfile);

export default router;
