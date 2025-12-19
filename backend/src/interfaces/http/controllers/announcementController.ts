import { Response } from "express";
import { CreateAnnouncementUseCase } from "../../../application/use-cases/announcement/CreateAnnouncementUseCase";
import {
  FilterAnnouncement,
  GetAnnouncementsUseCase,
} from "../../../application/use-cases/announcement/GetAnnouncementsUseCase";
import { DeleteAnnouncementUseCase } from "../../../application/use-cases/announcement/DeleteAnnouncementUseCase";
import { UpdateAnnouncementUseCase } from "../../../application/use-cases/announcement/UpdateAnnouncementUseCase";
import { AuthenticatedRequest } from "../middleware/authGuard";
import { BadRequestError, ForbiddenError } from "../middleware/HttpErrors";
import { HttpStatus } from "../../../domain/HttpStatus";
import { FilterQuery } from "mongoose";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { AnnouncementModel } from "../../../infrastructure/database/AnnouncementModel";

const createAnnouncementUseCase = new CreateAnnouncementUseCase();
const getAnnouncementsUseCase = new GetAnnouncementsUseCase();
const deleteAnnouncementUseCase = new DeleteAnnouncementUseCase();
const updateAnnouncementUseCase = new UpdateAnnouncementUseCase();

export const createAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, content, targetSectionId, isImportant, academicYear, semester } = req.body;
    const employeeId = req.user?.employeeId;

    if (!employeeId) {
      throw new BadRequestError("Author ID is required");
    }

    const announcement = await createAnnouncementUseCase.execute({
      title,
      content,
      authorId: employeeId,
      targetSectionId,
      isImportant,
      academicYear,
      semester,
    });

    res.status(HttpStatus.CREATED).json(announcement);
  } catch (error: any) {
    throw error;
  }
};

export const getAnnouncements = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { targetSectionId, authorId, academicYear, semester } = req.query;
    const filter: FilterQuery<FilterAnnouncement> = {};

    if (targetSectionId) filter.targetSectionId = targetSectionId;
    if (authorId) filter.authorId = authorId;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const announcements = await getAnnouncementsUseCase.execute(filter);
    res.status(HttpStatus.OK).json(announcements);
  } catch (error: any) {
    throw error;
  }
};

export const deleteAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.employeeId;

    if (!id) {
      throw new BadRequestError("Announcement ID is required");
    }

    const announcement = await AnnouncementModel.findById(id);
    if (!announcement) {
      throw new BadRequestError("Announcement not found");
    }

    if (announcement.authorId.toString() !== employeeId) {
      throw new ForbiddenError(
        "You are not authorized to delete this announcement"
      );
    }

    await deleteAnnouncementUseCase.execute(id);
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAnnouncement = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, content, isImportant } = req.body;
    const employeeId = req.user?.employeeId;

    if (!id) {
      throw new BadRequestError("Announcement ID is required");
    }
    const announcement = await AnnouncementModel.findById(id);
    if (!announcement) {
      throw new BadRequestError("Announcement not found");
    }

    if (announcement.authorId.toString() !== employeeId) {
      throw new ForbiddenError(
        "You are not authorized to update this announcement"
      );
    }

    const updatedAnnouncement = await updateAnnouncementUseCase.execute(id, {
      title,
      content,
      isImportant,
    });

    res.status(HttpStatus.OK).json(updatedAnnouncement);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
