import { StaffProfileModel } from "../../../infrastructure/database/StaffProfileModel";
import { StaffProfileDTO } from "../../../interfaces/http/types/StaffDTO";

export class GetStaffProfileUseCase {
  async execute(employeeId: string) {
    return await StaffProfileModel.findOne({
      employeeId,
    }).lean<StaffProfileDTO>();
  }
}
