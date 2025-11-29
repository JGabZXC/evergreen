import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  testProtected,
} from "../controllers/authController";
import { requireRole } from "../middleware/permissions";
import { authGuard } from "../middleware/authGuard";

const router = Router();

router.post(
  "/register",
  authGuard,
  requireRole("admin", "registrar"),
  register
);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/test-protected", authGuard, testProtected);

export default router;
