import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { TeacherDTO } from "../../../interfaces/http/types/StaffDTO";

export class GetTeacherUseCase {
  async execute(teacherId: string) {
    const teacher = await StaffModel.findById(teacherId)
      .populate("userId")
      .lean<TeacherDTO>();
    return teacher;
  }
}
