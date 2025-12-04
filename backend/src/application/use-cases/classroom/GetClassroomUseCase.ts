import { ClassroomModel } from "../../../infrastructure/database/ClassroomModel";
import { ClassroomDTO } from "../../../interfaces/http/types/ClassroomDTO";

export class GetClassroomUseCase {
  async execute(id: string) {
    return await ClassroomModel.findById(id).lean<ClassroomDTO>();
  }
}
