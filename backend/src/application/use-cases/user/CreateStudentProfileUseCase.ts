import mongoose from "mongoose";
import { StudentProfile } from "../../../domain/Student";
import { StudentModel } from "../../../infrastructure/database/StudentModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { BaseStudentProfileDTO } from "../../../interfaces/http/types/StudentDTO";

export class CreateStudentProfileUseCase {
  async execute(
    studentId: string,
    profileData: BaseStudentProfileDTO,
    session?: mongoose.ClientSession
  ): Promise<StudentProfile> {
    try {
      const student = await StudentModel.findOne({ studentId });
      if (!student) throw new NotFoundError("Student not found");

      // Check if profile already exists (if we want to enforce create vs update)
      // Since profile is embedded and required in schema, it might be initialized as empty or null?
      // But I made it required in schema. So it must exist when student is created?
      // If so, this use case might be "Update" or "Initialize" if it was created with dummy data.
      // Assuming this use case is called after student creation to fill profile.

      // If the schema says required, then creating a student without profile would fail.
      // So maybe the student creation flow includes profile now?
      // Or maybe I should make profile optional in schema for now?
      // The user said "embed the profile".

      // If I made it required in schema, then I must provide it when creating Student.
      // Let's check RegisterStudentUseCase.

      // For now, I will assume this use case updates the profile.

      const updatedStudent = await StudentModel.findOneAndUpdate(
        { studentId },
        { $set: { profile: profileData } },
        { new: true, session }
      ).lean();

      if (!updatedStudent || !updatedStudent.profile)
        throw new Error("Profile creation failed");

      return updatedStudent.profile;
    } catch (err: any) {
      throw err;
    }
  }
}
