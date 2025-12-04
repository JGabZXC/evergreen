import mongoose from "mongoose";
import { BaseStudentProfile, StudentProfile } from "../../../domain/Student";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";
import { BadRequestError } from "../../../interfaces/http/middleware/HttpErrors";
import { BaseStudentProfileDTO } from "../../../interfaces/http/types/StudentDTO";

export class CreateStudentProfileUseCase {
  async execute(
    studentId: String,
    profileData: BaseStudentProfileDTO,
    session?: mongoose.ClientSession
  ): Promise<StudentProfile> {
    try {
      const existingProfile = await StudentProfileModel.findOne({ studentId });
      if (existingProfile)
        throw new BadRequestError("Profile already exists for this student");

      const [profile] = await StudentProfileModel.create(
        [
          {
            ...profileData,
            studentId,
          },
        ],
        { session }
      );

      if (!profile) throw new Error("Profile creation failed");

      return profile;
    } catch (err: any) {
      throw err;
    }
  }
}
