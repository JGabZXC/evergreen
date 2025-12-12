import { Router } from "express";
import { authGuard } from "../middleware/authGuard";
import { isRegistrar } from "../middleware/permissions";
import { createRoom, getRoom, updateRoom } from "../controllers/roomController";

const router = Router();

router.use(authGuard, isRegistrar);
router.route("/").get(getRoom).post(createRoom);
router.route("/:roomId").get(getRoom).patch(updateRoom);

export default router;
