import {
  TeacherAcademicBackground as PrismaTeacherAcademicBackground,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from "../../generated/prisma/client";
import { TeacherAcademicBackground } from "../../domain/entities/TeacherAcademicBackground";
import { UserMapper } from "./UserMapper";
import { UserProfileMapper } from "./UserProfileMapper";

interface WithRelations extends PrismaTeacherAcademicBackground {
  userProfile?: PrismaUserProfile | null;
  approvedBy?: PrismaUser | null;
}

export class TeacherAcademicBackgroundMapper {
  static toDomain(raw: WithRelations) {
    return new TeacherAcademicBackground(
      raw.id,
      raw.userProfileId,
      raw.degree,
      raw.institution,
      raw.completedAt,
      raw.type,
      raw.isApproved,
      raw.approvedAt,
      raw.approvedById,
      raw.createdAt,
      raw.updatedAt,

      // NESTED PROPERTIES
      raw.userProfile
        ? UserProfileMapper.toDomainShallow(raw.userProfile)
        : null,
      raw.approvedBy ? UserMapper.toDomain(raw.approvedBy) : null,
    );
  }

  static toResponseShallow(
    domain: TeacherAcademicBackground,
  ) {
    return {
      degree: domain.degree,
      institution: domain.institution,
      completedAt: domain.completedAt.toISOString(),
      type: domain.type,
      isApproved: domain.isApproved,
      approvedAt: domain.approvedAt?.toISOString() || null,
      approvedById: domain.approvedById,
      createdAt: domain.createdAt.toISOString(),

      // NESTED PROPERTIES
      userProfile: domain.userProfile
        ? UserProfileMapper.toResponseShallow(domain.userProfile)
        : null,
      approvedBy: domain.approvedBy
        ? UserMapper.toResponseShallow(domain.approvedBy)
        : null,
    };
  }

  static toResponseDeep(
    domain: TeacherAcademicBackground,
  ) {
    return this.toResponseShallow(domain);
  }

  static toAdminResponse(
    domain: TeacherAcademicBackground,
  ) {
    return {
      ...this.toResponseShallow(domain),
      id: domain.id,
      userProfileId: domain.userProfileId,
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
