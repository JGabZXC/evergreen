import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar } from "../middleware/permissions";
import {
  deactivateUser,
  getAllStudents,
} from "../controllers/registrarController";

const router = Router();

router.get("/get-all-students", authGuard, isRegistrar, getAllStudents);
router.post("/deactivate-user", authGuard, isRegistrar, deactivateUser);

export default router;
