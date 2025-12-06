import { ClassScheduleModel } from "../../../infrastructure/database/ClassScheduleModel";

export class GetScheduleUseCase {
  async execute(id: string) {
    return await ClassScheduleModel.findById(id);
  }
}
