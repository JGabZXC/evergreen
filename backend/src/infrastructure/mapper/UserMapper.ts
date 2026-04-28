import { User } from "../../domain/entities/User";
import {
  User as PrismaUser,
  TeacherAcademicBackground as PrismaTeacherAcademicBackground,
  Specialization as PrismaSpecialization,
  UserProfile as PrismaUserProfile,
  UserAddress as PrismaUserAddress,
} from "../../generated/prisma/client";
import { UserResponse } from "../../application/dto/UserResponse";
import { UserProfileMapper } from "./UserProfileMapper";

interface WithUserProfile extends PrismaUser {
  userProfile?:
    | (PrismaUserProfile & {
        userAddress?: PrismaUserAddress | null;
        teacherAcademicBackground?:
          | (PrismaTeacherAcademicBackground & {
              approvedBy?: PrismaUser | null;
            })[]
          | null;
        specializations?:
          | (PrismaSpecialization & {
              approvedBy?: PrismaUser | null;
            })[]
          | null;
      })
    | null;
}

export class UserMapper {
  static toDomain(raw: WithUserProfile): User {
    return new User(
      raw.id,
      Number(raw.accountNumber),
      raw.email,
      raw.role,
      raw.isActive,
      raw.createdAt,
      raw.updatedAt,

      // NESTED PROPERTIES
      raw.userProfile ? UserProfileMapper.toDomain(raw.userProfile) : null,
    );
  }

  static toResponseShallow(domainUser: User): UserResponse {
    return {
      id: domainUser.id,
      accountNumber: domainUser.accountNumber,
      email: domainUser.email,
      role: domainUser.role,
    };
  }

  static toResponseDeep(domainUser: User) {
    return this.toResponseShallow(domainUser);
  }

  static toTokenPayload(domainUser: User) {
    return {
      id: domainUser.id,
      role: domainUser.role,
    };
  }

  static toAdminResponseShallow(domainUser: User) {
    return {
      id: domainUser.id,
      accountNumber: domainUser.accountNumber,
      email: domainUser.email,
      role: domainUser.role,
      isActive: domainUser.isActive,
      createdAt: domainUser.createdAt.toISOString(),
      updatedAt: domainUser.updatedAt.toISOString(),
    };
  }

    static toAdminResponseDeep(domainUser: User) {
    return {
      user: UserMapper.toAdminResponseShallow(domainUser),
      userProfile: domainUser.userProfile
        ? UserProfileMapper.toResponseDeep(domainUser.userProfile)
        : null,
    };
  }
}
