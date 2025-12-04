import mongoose from "mongoose";
import { StaffProfileModel } from "../../../infrastructure/database/StaffProfileModel";
import { flattenObject } from "../../../interfaces/http/utils/flattenObject";
import {
  BaseStaffProfileDTO,
  StaffProfileDTO,
} from "../../../interfaces/http/types/StaffDTO";
import { formatDateToUTC } from "../../../interfaces/http/utils/date";

export class UpdateStaffProfileUseCase {
  async execute(
    employeeId: string,
    profileData: Partial<BaseStaffProfileDTO>,
    session?: mongoose.ClientSession
  ) {
    if (profileData.dateOfBirth)
      profileData.dateOfBirth = formatDateToUTC(profileData.dateOfBirth);

    const flattenedObject = flattenObject(profileData);
    try {
      const updatedProfile = await StaffProfileModel.findOneAndUpdate(
        { employeeId },
        { $set: flattenedObject },
        { new: true, session: session ?? null }
      ).lean<StaffProfileDTO>();

      if (!updatedProfile) {
        throw new Error("Profile update failed or profile not found");
      }
      return updatedProfile;
    } catch (err: any) {
      throw err;
    }
  }
}
