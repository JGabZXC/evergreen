import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";

export class GetScheduleUseCase {
  async execute(id: string) {
    return await SubjectScheduleModel.findById(id)
      .populate("subject")
      .populate("schedules.room")
      .populate({
        path: "schedules.teacher",
        populate: { path: "userId" },
      })
      .lean<SubjectScheduleDTO>();
  }
}
