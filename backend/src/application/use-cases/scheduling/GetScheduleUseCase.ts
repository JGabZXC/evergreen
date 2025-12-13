import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";
import { SubjectScheduleDTO } from "../../../interfaces/http/types/SubjectScheduleDTO";

export class GetScheduleUseCase {
  async execute(id: string) {
    return await SubjectScheduleModel.findById(id)
      .populate("subject")
      .populate({
        path: "teacher",
        populate: "userId",
      })
      .lean<SubjectScheduleDTO>();
  }
}
