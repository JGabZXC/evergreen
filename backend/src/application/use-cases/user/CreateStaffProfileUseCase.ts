import mongoose from "mongoose";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../../interfaces/http/middleware/HttpErrors";
import { formatDateToUTC } from "../../../interfaces/http/utils/date";
import { BaseStaffProfileDTO } from "../../../interfaces/http/types/StaffDTO";

export class CreateStaffProfileUseCase {
  async execute(
    employeeId: string,
    profileData: BaseStaffProfileDTO,
    session?: mongoose.ClientSession
  ) {
    try {
      const staff = await StaffModel.findOne({ employeeId });
      if (!staff) throw new NotFoundError("Staff not found");

      profileData.dateOfBirth = formatDateToUTC(profileData.dateOfBirth);

      const updatedStaff = await StaffModel.findOneAndUpdate(
        { employeeId },
        { $set: { profile: profileData } },
        { new: true, session }
      ).lean();

      if (!updatedStaff || !updatedStaff.profile)
        throw new Error("Profile creation failed");

      return updatedStaff.profile;
    } catch (err: any) {
      throw err;
    }
  }
}
