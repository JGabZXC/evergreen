import {
  Specialization as PrismaSpecialization,
  User as PrismaUser,
} from "../../generated/prisma/client";
import { Specialization } from "../../domain/entities/Specialization";
import { UserMapper } from "./UserMapper";

interface WithRelation extends PrismaSpecialization {
  approvedBy?: PrismaUser | null;
}

export class SpecializationMapper {
  static toDomain(raw: WithRelation) {
    return new Specialization(
      raw.id,
      raw.userProfileId,
      raw.name,
      raw.description,
      raw.isApproved,
      raw.approvedAt,
      raw.approvedById,
      raw.createdAt,
      raw.updatedAt,

      // NESTED PROPERTIES
      raw.approvedBy ? UserMapper.toDomain(raw.approvedBy) : null,
    );
  }

  static toResponseShallow(domain: Specialization) {
    return {
      name: domain.name,
      description: domain.description,
      isApproved: domain.isApproved,
      approvedAt: domain.approvedAt?.toISOString() || null,
      approvedById: domain.approvedById,
      createdAt: domain.createdAt.toISOString(),

      // NESTED PROPERTIES
      approvedBy: domain.approvedBy
        ? UserMapper.toResponseShallow(domain.approvedBy)
        : null,
    };
  }

  static toResponseDeep(domain: Specialization) {
    return this.toResponseShallow(domain);
  }
}
