import mongoose from "mongoose";
import { StudentModel } from "../../infrastructure/database/StudentModel";
import { BaseUser, User } from "../../domain/User";
import { AuthService } from "../services/authService";
import { UserModel } from "../../infrastructure/database/UserModel";
import { IdGeneratorService } from "../services/idGeneratorService";

export class RegisterStudentUseCase {
  private authService = new AuthService();
  private idGeneratorService = new IdGeneratorService();

  async execute(
    data: BaseUser & { course: string },
    session?: mongoose.ClientSession
  ): Promise<{ createdUser: User; studentId: string }> {
    try {
      data.password = await this.authService.hashPassword(data.password);

      const [createdUser] = await UserModel.create([data], { session });
      const studentId = this.idGeneratorService.generateStudentId();

      if (!createdUser) throw new Error("User creation failed");

      await StudentModel.create(
        [
          {
            userId: createdUser._id,
            studentId: studentId,
            course: data.course,
          },
        ],
        {
          session,
        }
      );

      return { createdUser, studentId };
    } catch (err: any) {
      throw err;
    }
  }
}
