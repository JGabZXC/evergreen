import { UserModel } from "../../infrastructure/database/UserModel";
import { StudentModel } from "../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../infrastructure/database/StudentProfileModel";
import { BaseUser, User } from "../../domain/User";
import { BaseStudentProfile } from "../../domain/Student";
import { AuthService } from "./authService";
import { BaseStaffProfile, Staff } from "../../domain/Staff";
import { StaffModel } from "../../infrastructure/database/StaffModel";
import { StaffProfileModel } from "../../infrastructure/database/StaffProfileModel";
import { BadRequestError } from "../../interfaces/http/middleware/HttpErrors";
import { StaffRole, StudentRole } from "../../domain/types/Role";

export class UserCreationService {
  private authService = new AuthService();

  private async generateId(
    model: any,
    fieldName: string,
    prefix: string
  ): Promise<string> {
    const lastDocument = await model.collection.findOne(
      {},
      {
        sort: { [fieldName]: -1 },
        projection: { [fieldName]: 1 },
      }
    );

    if (!lastDocument) {
      return `${prefix}-1`;
    }

    const lastId = lastDocument[fieldName] as string;
    const lastSequence = parseInt(lastId.split("-")[1] ?? "");

    return `${prefix}-${lastSequence + 1}`;
  }

  private async generateSudentId(): Promise<string> {
    return this.generateId(StudentModel, "studentId", "STU");
  }

  private async generateEmployeeId(): Promise<string> {
    return this.generateId(StaffModel, "employeeId", "EMP");
  }

  async createUserWithRole(
    userData: BaseUser,
    profileData?: BaseStudentProfile | BaseStaffProfile
  ) {
    const mongoose = await import("mongoose");
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Hash password
      userData.password = await this.authService.hashPassword(
        userData.password
      );

      // Create user
      let user: User;
      try {
        const createdUsers = await UserModel.create([userData], { session });
        user = createdUsers[0] as User;
      } catch (err: any) {
        if (err.code === 11000) {
          throw new BadRequestError("Email already exists", err.keyValue);
        }
        throw err;
      }

      if (user.role === StudentRole.Student) {
        const studentId = await this.generateSudentId();
        await StudentModel.create(
          [
            {
              userId: user._id,
              studentId,
            },
          ],
          { session }
        );

        if (profileData) {
          await StudentProfileModel.create(
            [
              {
                ...(profileData as BaseStudentProfile),
                studentId,
              },
            ],
            { session }
          );
        }

        return { user, studentId };
      }

      if (Object.values(StaffRole).includes(user.role)) {
        const employeeId = await this.generateEmployeeId();
        await StaffModel.create(
          [
            {
              userId: user._id,
              employeeId,
            },
          ],
          { session }
        );

        if (profileData) {
          await StaffProfileModel.create(
            [
              {
                ...(profileData as BaseStaffProfile),
                employeeId,
              },
            ],
            { session }
          );
        }

        return { user, employeeId };
      }

      await session.commitTransaction();
      return { user };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
