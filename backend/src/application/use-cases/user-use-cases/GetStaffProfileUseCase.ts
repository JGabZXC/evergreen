import { StaffProfileModel } from "../../../infrastructure/database/StaffProfileModel";

export class GetStaffProfileUseCase {
  async execute(employeeId: string) {
    return await StaffProfileModel.findOne({ employeeId });
  }
}
