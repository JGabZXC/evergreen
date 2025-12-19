import { AnnouncementModel } from "../../../infrastructure/database/AnnouncementModel";
import { BaseAnnouncement } from "../../../domain/Announcement";

export class UpdateAnnouncementUseCase {
  async execute(id: string, data: Partial<BaseAnnouncement>) {
    const announcement = await AnnouncementModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    return announcement;
  }
}
