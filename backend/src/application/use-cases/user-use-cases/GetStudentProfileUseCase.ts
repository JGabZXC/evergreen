import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";

export class GetStudentProfileUseCase {
  async execute(studentId: string) {
    return await StudentProfileModel.findOne({ studentId });
  }
}
