import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";
import { StaffProfileDTO } from "../../../interfaces/http/types/StaffDTO";

export class GetStudentProfileUseCase {
  async execute(studentId: string) {
    return await StudentProfileModel.findOne({
      studentId,
    }).lean<StaffProfileDTO>();
  }
}
