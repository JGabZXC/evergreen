import mongoose from "mongoose";
import { StaffProfileModel } from "../../../infrastructure/database/StaffProfileModel";
import { BadRequestError } from "../../../interfaces/http/middleware/HttpErrors";
import { formatDateToUTC } from "../../../interfaces/http/utils/date";
import { BaseStaffProfileDTO } from "../../../interfaces/http/types/StaffDTO";

export class CreateStaffProfileUseCase {
  async execute(
    employeeId: string,
    profileData: BaseStaffProfileDTO,
    session?: mongoose.ClientSession
  ) {
    try {
      const existingProfile = await StaffProfileModel.findOne({ employeeId });
      profileData.dateOfBirth = formatDateToUTC(profileData.dateOfBirth);

      if (existingProfile) {
        throw new BadRequestError(
          "Profile already exists for this staff member"
        );
      }

      const [profile] = await StaffProfileModel.create(
        [
          {
            ...profileData,
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
