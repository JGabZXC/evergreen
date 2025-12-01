import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar } from "../middleware/permissions";
import {
  createSubject,
  deactivateUser,
  getAllStudents,
} from "../controllers/registrarController";

const router = Router();

router.get("/get-all-students", authGuard, isRegistrar, getAllStudents);
router.post("/deactivate-users", authGuard, isRegistrar, deactivateUser);
router.post("/add-subject", authGuard, isRegistrar, createSubject);

export default router;
