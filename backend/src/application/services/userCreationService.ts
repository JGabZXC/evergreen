import mongoose from "mongoose";
import { UserModel } from "../../infrastructure/database/UserModel";
import { StudentModel } from "../../infrastructure/database/StudentModel";
import { StudentProfileModel } from "../../infrastructure/database/StudentProfileModel";
import { BaseUser, User } from "../../domain/User";
import { BaseStudentProfile } from "../../domain/Student";
import { AuthService } from "./authService";
import { BaseStaffProfile } from "../../domain/Staff";
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      userData.password = await this.authService.hashPassword(
        userData.password
      );

      let user: User;
      let studentId: string | undefined;
      let employeeId: string | undefined;
      try {
        const createdUsers = await UserModel.create([userData], { session });
        user = createdUsers[0] as User;

        if (user.role === StudentRole.Student) {
          studentId = await this.generateSudentId();
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
        }

        const staffRoles = Object.values(StaffRole) as string[];
        if (staffRoles.includes(user.role as string)) {
          employeeId = await this.generateEmployeeId();
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
        }
      } catch (err: any) {
        if (err.code === 11000) {
          throw new BadRequestError("Email already exists", err.keyValue);
        }
        throw err;
      }

      await session.commitTransaction();
      if (studentId) return { user, studentId };
      if (employeeId) return { user, employeeId };
      return { user };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
