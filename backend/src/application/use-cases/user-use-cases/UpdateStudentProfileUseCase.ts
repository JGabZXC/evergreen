import mongoose from "mongoose";
import { BaseStudentProfile } from "../../../domain/Student";
import { StudentProfileModel } from "../../../infrastructure/database/StudentProfileModel";
import { flattenObject } from "../../../interfaces/http/utils/flattenObject";

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
      );
      if (!updatedProfile) {
        throw new Error("Profile update failed or profile not found");
      }
      return updatedProfile;
    } catch (err: any) {
      throw err;
    }
  }
}
