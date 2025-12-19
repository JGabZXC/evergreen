import { FilterQuery } from "mongoose";
import { AnnouncementModel } from "../../../infrastructure/database/AnnouncementModel";
import { Announcement } from "../../../domain/Announcement";

export interface FilterAnnouncement {
  targetSectionId?: string;
  authorId?: string;
  academicYear?: string;
  semester?: string;
}

export class GetAnnouncementsUseCase {
  async execute(filter: FilterQuery<FilterAnnouncement> = {}) {
    // Sort by createdAt descending (newest first)
    const announcements = await AnnouncementModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "author", populate: "userId" })
      .lean();
    return announcements;
  }
}
