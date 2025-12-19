import { Router } from "express";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
} from "../controllers/announcementController";
import { authGuard } from "../middleware/authGuard";
import { isTeacher } from "../middleware/permissions";

const router = Router();

router
  .route("/")
  .post(authGuard, isTeacher, createAnnouncement)
  .get(authGuard, isTeacher, getAnnouncements);
router
  .route("/:id")
  .delete(authGuard, isTeacher, deleteAnnouncement)
  .patch(authGuard, isTeacher, updateAnnouncement);

export default router;
