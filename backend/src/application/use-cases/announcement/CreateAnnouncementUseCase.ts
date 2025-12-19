import { AnnouncementModel } from "../../../infrastructure/database/AnnouncementModel";
import { BaseAnnouncement } from "../../../domain/Announcement";

export class CreateAnnouncementUseCase {
  async execute(data: BaseAnnouncement) {
    const announcement = new AnnouncementModel(data);
    await announcement.save();
    return announcement;
  }
}
