import mongoose from "mongoose";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
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

    // Wrap in profile to target embedded field
    const flattenedObject = flattenObject({ profile: profileData });
    try {
      const updatedStaff = await StaffModel.findOneAndUpdate(
        { employeeId },
        { $set: flattenedObject },
        { new: true, session: session ?? null }
      ).lean();

      if (!updatedStaff || !updatedStaff.profile) {
        throw new Error("Profile update failed or staff not found");
      }
      return updatedStaff.profile as StaffProfileDTO;
    } catch (err: any) {
      throw err;
    }
  }
}
