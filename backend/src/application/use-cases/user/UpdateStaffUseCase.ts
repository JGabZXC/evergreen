import mongoose from "mongoose";
import { StaffModel } from "../../../infrastructure/database/StaffModel";
import {
  PopulatedStaffDTO,
  StaffDTO,
} from "../../../interfaces/http/types/StaffDTO";
import { NotFoundError } from "../../../interfaces/http/middleware/HttpErrors";
import { flattenObject } from "../../../interfaces/http/utils/flattenObject";
import { UserDTOPopulated } from "../../../interfaces/http/types/UserDTO";

export class UpdateStaffUseCase {
  async execute(
    employeeId: string,
    data: Partial<StaffDTO>,
    session?: mongoose.ClientSession
  ) {
    const flattenedData = flattenObject(data);

    const updatedStaff = await StaffModel.findOneAndUpdate(
      { employeeId },
      { $set: flattenedData },
      { new: true, session: session || null }
    )
      .populate("userId")
      .lean<PopulatedStaffDTO>();

    if (!updatedStaff) {
      throw new NotFoundError("Staff not found");
    }

    return updatedStaff;
  }
}
