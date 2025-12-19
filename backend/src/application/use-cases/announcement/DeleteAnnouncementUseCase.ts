import { AnnouncementModel } from "../../../infrastructure/database/AnnouncementModel";

export class DeleteAnnouncementUseCase {
  async execute(id: string) {
    const result = await AnnouncementModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error("Announcement not found");
    }
    return result;
  }
}
