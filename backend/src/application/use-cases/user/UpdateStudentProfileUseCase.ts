import mongoose from "mongoose";
import { BaseStudentProfile } from "../../../domain/Student";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";
import { flattenObject } from "../../../interfaces/http/utils/flattenObject";
import { StudentProfileDTO } from "../../../interfaces/http/types/StudentDTO";

export class UpdateStudentProfileUseCase {
  async execute(
    studentId: string,
    profileData: Partial<BaseStudentProfile>,
    session?: mongoose.ClientSession
  ) {
    const flattenedObject = flattenObject(profileData);
    try {
      const updatedProfile = await StudentProfileModel.findOneAndUpdate(
        { studentId },
        { $set: flattenedObject },
        { new: true, session: session ?? null }
      ).lean<StudentProfileDTO>();

      return updatedProfile;
    } catch (err: any) {
      throw err;
    }
  }
}
