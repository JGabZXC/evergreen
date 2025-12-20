import { StudentModel } from "../../../infrastructure/database/StudentModel";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import { BaseStudentProfile } from "../../../domain/Student";

export class UpdateStudentProfileUseCase {
  async execute(userId: string, profileData: Partial<BaseStudentProfile>) {
    const student = await StudentModel.findOne({ userId });

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    // Update profile fields
    // We can use dot notation or merge.
    // Since profile is an embedded object, we might want to be careful not to overwrite everything if we only send partial data.
    // But usually the form sends the whole profile or we merge it.

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
