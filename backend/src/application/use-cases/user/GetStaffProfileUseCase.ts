import { StaffModel } from "../../../infrastructure/database/StaffModel";
import { StaffProfileDTO } from "../../../interfaces/http/types/StaffDTO";

export class GetStaffProfileUseCase {
  async execute(employeeId: string) {
    const staff = await StaffModel.findOne({
      employeeId,
    }).lean();

    return staff?.profile as StaffProfileDTO | null;
  }
}
