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
import { customAlphabet } from "nanoid";
import { BaseTeacherDetails } from "../../domain/TeacherDetails";
import { TeacherDetailsModel } from "../../infrastructure/database/TeacherDetailsModel";

const generateNumericId = customAlphabet("0123456789", 10);

export class UserCreationService {
  private authService = new AuthService();

  private async generateId(prefix: string): Promise<string> {
    const id = generateNumericId();

    return `${prefix}-${id}`;
  }

  private async generateSudentId(): Promise<string> {
    return this.generateId("STU");
  }

  private async generateEmployeeId(): Promise<string> {
    return this.generateId("EMP");
  }

  async createUserWithRole(
    userData: BaseUser,
    profileData?: BaseStudentProfile | BaseStaffProfile,
    session?: mongoose.ClientSession
  ) {
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

          if (profileData)
            await this.createProfile(
              studentId,
              "student",
              profileData,
              session
            );
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

          if (profileData)
            await this.createProfile(employeeId, "staff", profileData, session);
        }
      } catch (err: any) {
        if (err.code === 11000) {
          throw new BadRequestError("Email already exists", err.keyValue);
        }
        throw err;
      }

      if (studentId) return { user, studentId };
      if (employeeId) return { user, employeeId };
      return { user };
    } catch (err) {
      throw err;
    }
  }

  async createProfile(
    id: string,
    type: "student" | "staff",
    profileData: BaseStaffProfile | BaseStudentProfile,
    session?: mongoose.ClientSession
  ) {
    let profile;
    if (type === "student") {
      profile = await StudentProfileModel.create(
        [
          {
            ...(profileData as BaseStudentProfile),
            studentId: id,
          },
        ],
        { session }
      );
    }

    if (type === "staff") {
      profile = await StaffProfileModel.create(
        [
          {
            ...(profileData as BaseStaffProfile),
            employeeId: id,
          },
        ],
        { session }
      );
    }

    return profile;
  }

  async createTeacherDetails(
    details: BaseTeacherDetails,
    session?: mongoose.ClientSession
  ) {
    const teacherDetailsArray = await TeacherDetailsModel.create([details], {
      session,
    });
    return teacherDetailsArray[0];
  }
}
