import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import { BaseStudentProfile } from "../../../domain/Student";

export class UpdateStudentProfileUseCase {
  async execute(
    id: string,
    profileData: Partial<BaseStudentProfile>,
    byUserId: boolean = true
  ) {
    const query = byUserId ? { userId: id } : { _id: id };
    const student = await StudentModel.findOne(query);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    if (!student.profile) {
      student.profile = profileData as BaseStudentProfile;
    } else {
      // Merge
      student.profile = { ...student.profile, ...profileData };
    }

    await student.save();

    return student.profile;
  }
}
