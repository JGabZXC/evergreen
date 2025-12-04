import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";

export class GetClassroomUseCase {
  async execute(id: string) {
    return await ClassroomModel.findById(id);
  }
}
