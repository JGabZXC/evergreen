import mongoose from "mongoose";
import { StaffModel } from "../../infrastructure/database/StaffModel";
import { BaseUser } from "../../domain/User";
import { AuthService } from "../services/authService";
import { UserModel } from "../../infrastructure/database/UserModel";
import { IdGeneratorService } from "../services/idGeneratorService";

export class RegisterStaffUseCase {
  private authService = new AuthService();
  private idGeneratorService = new IdGeneratorService();
  async execute(data: BaseUser, session?: mongoose.ClientSession) {
    data.password = await this.authService.hashPassword(data.password);

    try {
      const [createdUser] = await UserModel.create([data], { session });
      const staffId = this.idGeneratorService.generateEmployeeId();

      if (!createdUser) throw new Error("User creation failed");

      await StaffModel.create(
        [{ userId: createdUser._id, employeeId: staffId }],
        {
          session,
        }
      );

      return { createdUser, employeeId: staffId };
    } catch (err: any) {
      throw err;
    }
  }
}
