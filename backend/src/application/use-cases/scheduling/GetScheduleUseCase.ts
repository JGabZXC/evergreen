import { SubjectScheduleModel } from "../../../infrastructure/database/SubjectScheduleModel";

export class GetScheduleUseCase {
  async execute(id: string) {
    return await SubjectScheduleModel.findById(id);
  }
}
